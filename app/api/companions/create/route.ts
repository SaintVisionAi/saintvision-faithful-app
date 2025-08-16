import { NextRequest, NextResponse } from 'next/server'

interface CompanionConfig {
  name: string
  avatar: string
  skillset: string
  features: string[]
  permissions: string
  voiceEnabled: boolean
  files: File[]
}

export async function POST(request: NextRequest) {
  try {
    const config: CompanionConfig = await request.json()
    
    // Generate unique companion ID
    const companionId = `companion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create companion configuration
    const companion = {
      id: companionId,
      name: config.name,
      avatar: config.avatar,
      skillset: config.skillset,
      features: config.features,
      permissions: config.permissions,
      voiceEnabled: config.voiceEnabled,
      subdomain: config.name.toLowerCase().replace(/\s+/g, '-'),
      created: new Date().toISOString(),
      status: 'active',
      tier: determineTier(config.features),
      systemPrompt: generateSystemPrompt(config),
      endpoints: generateEndpoints(config)
    }
    
    // In production, this would save to database
    // For now, we'll simulate the creation
    
    return NextResponse.json({
      success: true,
      companionId: companionId,
      companion: companion,
      url: `${companion.subdomain}.saintvisionai.com/console`,
      message: `${config.name} has been created successfully!`
    })
    
  } catch (error) {
    console.error('Error creating companion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create companion' },
      { status: 500 }
    )
  }
}

function determineTier(features: string[]): string {
  if (features.length === 0) return 'free'
  if (features.includes('voice') || features.includes('ghl')) return 'pro'
  return 'basic'
}

function generateSystemPrompt(config: CompanionConfig): string {
  const skillsetPrompts = {
    general: 'You are a general productivity assistant focused on task management, scheduling, and helping users stay organized and efficient.',
    legal: 'You are a legal navigator AI with expertise in contract review, compliance guidance, and legal research. Always remind users to consult with qualified attorneys for specific legal advice.',
    crm: 'You are a CRM specialist focused on lead management, sales automation, and customer relationship optimization. You integrate with GoHighLevel and other CRM systems.',
    realestate: 'You are a real estate dealbot specializing in property analysis, market research, investment calculations, and deal structuring for real estate professionals.',
    healthcare: 'You are a cognitive healthcare assistant providing compassionate support, therapy guidance, and wellness tracking. Always maintain HIPAA compliance and encourage users to consult healthcare professionals.',
    custom: 'You are a custom AI assistant tailored to the user\'s specific needs and requirements.'
  }
  
  const basePrompt = skillsetPrompts[config.skillset as keyof typeof skillsetPrompts] || skillsetPrompts.general
  
  let featuresPrompt = ''
  if (config.features.includes('voice')) {
    featuresPrompt += ' You support both text and voice communication, adapting your responses for natural conversation flow.'
  }
  if (config.features.includes('research')) {
    featuresPrompt += ' You have access to real-time web research and can provide current information and analysis.'
  }
  if (config.features.includes('ghl')) {
    featuresPrompt += ' You can integrate with GoHighLevel CRM for lead management and automation.'
  }
  
  return `${basePrompt}${featuresPrompt} Your name is ${config.name}. Always be helpful, professional, and aligned with HACP™ principles of responsible AI.`
}

function generateEndpoints(config: CompanionConfig): any {
  const endpoints = {
    chat: `/api/companions/${config.name.toLowerCase().replace(/\s+/g, '-')}/chat`,
    voice: config.features.includes('voice') ? `/api/companions/${config.name.toLowerCase().replace(/\s+/g, '-')}/voice` : null,
    research: config.features.includes('research') ? `/api/search/companion` : null,
    ghl: config.features.includes('ghl') ? `/api/ghl/companion` : null,
    documents: config.features.includes('documents') ? `/api/documents/process` : null
  }
  
  return endpoints
}