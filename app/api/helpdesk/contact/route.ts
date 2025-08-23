import { NextRequest, NextResponse } from 'next/server'
import { openaiClient } from '@/lib/clients/openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CONTACT_FORM_PROMPT = `You are SAL, the expert sales and support assistant for SAINTVISIONAI™. A potential customer has submitted a contact form. 

Your response should:
1. Thank them for their interest in SAINTVISIONAI and HACP™
2. Address their specific inquiry with detailed, helpful information
3. Recommend the most appropriate pricing tier based on their needs
4. Provide next steps and call-to-action
5. Demonstrate expertise in the areas they mentioned (GHL, technical, sales, etc.)
6. Be professional, knowledgeable, and focused on solving their business challenges

PRICING TIERS TO REFERENCE:
- Starter ($29/month): Perfect for small businesses getting started with AI
- Professional ($79/month): Ideal for growing businesses needing advanced features  
- White Label ($500/month): For agencies wanting to rebrand and resell
- Custom ($2500/month): Enterprise solutions with dedicated support

Always aim to schedule a demo or consultation to close the loop on sales inquiries.`

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, subject, message, inquiryType } = await request.json()

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    console.log('Processing contact form submission...')

    // Store contact inquiry in database
    let contactId = null
    try {
      const { data: contact, error: contactError } = await supabase
        .from('contact_inquiries')
        .insert({
          name,
          email,
          company: company || null,
          subject: subject || 'General Inquiry',
          message,
          inquiry_type: inquiryType || 'general',
          status: 'new',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!contactError && contact) {
        contactId = contact.id
      }
    } catch (dbError) {
      console.log('Database storage failed (non-critical):', dbError)
    }

    // Generate SAL's intelligent response
    const userInquiry = `
CONTACT FORM SUBMISSION:
Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject || 'General Inquiry'}
Inquiry Type: ${inquiryType || 'General'}

MESSAGE:
${message}
`

    const completion = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: CONTACT_FORM_PROMPT },
        { role: 'user', content: userInquiry }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    })

    const salResponse = completion.choices[0]?.message?.content

    if (!salResponse) {
      throw new Error('No response generated from SAL')
    }

    // Update contact record with SAL's response
    if (contactId) {
      try {
        await supabase
          .from('contact_inquiries')
          .update({ 
            sal_response: salResponse,
            status: 'responded',
            updated_at: new Date().toISOString()
          })
          .eq('id', contactId)
      } catch (updateError) {
        console.log('Database update failed (non-critical):', updateError)
      }
    }

    // Determine follow-up actions based on inquiry type
    let followUpActions = []
    if (inquiryType === 'sales' || subject?.toLowerCase().includes('demo')) {
      followUpActions.push('Schedule demo call')
      followUpActions.push('Send pricing comparison guide')
    }
    if (inquiryType === 'technical' || message.toLowerCase().includes('api')) {
      followUpActions.push('Provide API documentation')
      followUpActions.push('Schedule technical consultation')
    }
    if (message.toLowerCase().includes('gohighlevel') || message.toLowerCase().includes('ghl')) {
      followUpActions.push('Send GHL integration guide')
      followUpActions.push('Schedule GHL consultation')
    }

    console.log('Contact form processed successfully')

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting SAINTVISIONAI! SAL has generated a personalized response.',
      sal_response: salResponse,
      contact_id: contactId,
      follow_up_actions: followUpActions,
      recommended_tier: determineRecommendedTier(message, company),
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: `Contact form processing failed: ${error.message}` },
      { status: 500 }
    )
  }
}

// Helper function to recommend pricing tier based on inquiry
function determineRecommendedTier(message: string, company?: string): string {
  const messageLower = message.toLowerCase()
  
  if (messageLower.includes('enterprise') || messageLower.includes('large scale') || 
      messageLower.includes('custom') || (company && company.length > 50)) {
    return 'Custom ($2500/month) - Enterprise Solution'
  }
  
  if (messageLower.includes('agency') || messageLower.includes('white label') || 
      messageLower.includes('reseller') || messageLower.includes('rebrand')) {
    return 'White Label ($500/month) - Agency Solution'
  }
  
  if (messageLower.includes('growing') || messageLower.includes('scale') || 
      messageLower.includes('advanced') || messageLower.includes('team')) {
    return 'Professional ($79/month) - Growing Business'
  }
  
  return 'Starter ($29/month) - Perfect for Getting Started'
}