import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Map plan names to Stripe Price IDs
const PRICE_IDS = {
  'Free': process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
  'Pro': process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  'Unlimited': process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID,
  'Enterprise': process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  'White Label': process.env.NEXT_PUBLIC_STRIPE_WHITE_LABEL_PRICE_ID,
  'Custom': process.env.NEXT_PUBLIC_STRIPE_CUSTOM_PRICE_ID,
} as const

export async function POST(request: NextRequest) {
  try {
    const { planName, successUrl, cancelUrl } = await request.json()

    if (!planName || !PRICE_IDS[planName as keyof typeof PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Invalid plan name' },
        { status: 400 }
      )
    }

    if (planName === 'Free') {
      // Free plan doesn't need Stripe checkout
      return NextResponse.json(
        { message: 'Free plan signup - redirect to dashboard' },
        { status: 200 }
      )
    }

    if (planName === 'Enterprise') {
      // Enterprise needs custom pricing - redirect to contact
      return NextResponse.json(
        { message: 'Enterprise plan - redirect to contact sales' },
        { status: 200 }
      )
    }

    const priceId = PRICE_IDS[planName as keyof typeof PRICE_IDS]
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 400 }
      )
    }

    // Check if this is a one-time payment (Custom deposit)
    const isOneTimePayment = planName === 'Custom'
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: isOneTimePayment ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXTAUTH_URL || 'https://hacp.ai'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'https://hacp.ai'}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: planName,
        domain: 'hacp.ai',
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}