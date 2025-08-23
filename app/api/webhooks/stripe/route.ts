import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  'price_1RsblIFZsXxBWnjQMMw18RI5': 'free',
  'price_1RLChrFZsXxBWnjQVcrcVeDf': 'pro', 
  'price_1RINIMFZsXxBWnjQEYxlyUIy': 'unlimited',
  'price_1RINqyFZsXxBWnjQRIBgd1cP': 'enterprise',
  'price_1RyatqFZsXxBWnjQqdWT3PGu': 'white_label',
  'price_1RIh5yFZsXxBWnjQw0p9KYOj': 'custom',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log(`Received webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Checkout completed for hacp.ai:', {
          sessionId: session.id,
          customerEmail: session.customer_details?.email,
          plan: session.metadata?.plan,
          domain: session.metadata?.domain,
        })

        // Create or update user profile with Stripe customer ID
        if (session.customer_details?.email) {
          const { data: user } = await supabase.auth.admin.getUserByEmail(session.customer_details.email)
          
          if (user?.user) {
            await supabase
              .from('user_profiles')
              .upsert({
                id: user.user.id,
                email: session.customer_details.email,
                stripe_customer_id: session.customer as string,
                subscription_status: session.mode === 'subscription' ? 'active' : 'free',
                updated_at: new Date().toISOString(),
              })
          }
        }

        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const planName = PRICE_TO_PLAN[priceId] || 'unknown'
        
        console.log('Subscription created for hacp.ai:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId,
          planName,
        })

        // Find user by Stripe customer ID and update subscription
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (userProfile) {
          // Create subscription record
          await supabase.from('subscriptions').insert({
            user_id: userProfile.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            plan_name: planName,
            price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

          // Update user profile with subscription info
          await supabase
            .from('user_profiles')
            .update({
              subscription_status: subscription.status,
              subscription_plan: planName,
              stripe_subscription_id: subscription.id,
              subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProfile.id)

          // Update user limits based on plan
          await supabase.rpc('update_user_limits', {
            user_uuid: userProfile.id,
            plan_name: planName,
          })

          // Create default agent for new subscribers
          if (planName !== 'free') {
            await supabase.from('ai_agents').insert({
              user_id: userProfile.id,
              name: 'SAL Assistant',
              type: 'companion',
              model: 'claude-opus-4',
              system_prompt: 'You are SAL, a helpful AI assistant from SAINTVISIONAI. You are powered by the HACP™ protocol and provide intelligent, thoughtful responses.',
              personality: 'Professional, helpful, and intelligent',
              capabilities: ['conversation', 'analysis', 'creativity', 'problem-solving'],
            })
          }
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription updated for hacp.ai:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Update user profile status
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: subscription.status,
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription cancelled for hacp.ai:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        })

        // Update user to free plan
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userProfile) {
          await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'canceled',
              subscription_plan: 'free',
              stripe_subscription_id: null,
              subscription_ends_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProfile.id)

          // Reset to free plan limits
          await supabase.rpc('update_user_limits', {
            user_uuid: userProfile.id,
            plan_name: 'free',
          })

          // Deactivate agents beyond free limit
          await supabase
            .from('ai_agents')
            .update({ is_active: false })
            .eq('user_id', userProfile.id)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Keep only the first agent
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error(`Webhook handler failed:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}