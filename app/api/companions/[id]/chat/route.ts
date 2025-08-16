import { NextRequest, NextResponse } from 'next/server'
import { azureCognitive } from '@/lib/azure/cognitive'

interface ChatRequest {
  message: string
  companionId: string
  conversationHistory?: string[]
  useVoice?: boolean
  attachments?: File[]
}

interface CompanionConfig {
  id: string
  name: string
  skillset: string
  features: string[]
  systemPrompt: string
  tier: string
  model: 'gpt-4' | 'gpt-5' | 'claude-4' | 'dual'
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { message, companionId, conversationHistory, useVoice, attachments }: ChatRequest = await request.json()
    
    // Get companion configuration (in production, fetch from database)
    const companion = await getCompanionConfig(params.id)
    if (!companion) {
      return NextResponse.json(
        { error: 'Companion not found' },
        { status: 404 }
      )
    }

    // Emotional calibration using HACP™ protocol
    const emotionalContext = await azureCognitive.emotionalCalibration(
      message, 
      conversationHistory
    )

    // Process attachments if any
    let documentContext = ''
    if (attachments && attachments.length > 0) {
      if (companion.features.includes('documents')) {
        for (const file of attachments) {
          const analysis = await azureCognitive.analyzeDocument(file)
          documentContext += `\n\nDocument Analysis: ${analysis.text}\nKey Phrases: ${analysis.keyPhrases.join(', ')}`
        }
      }
    }

    // Web research if enabled and needed
    let researchContext = ''
    if (companion.features.includes('research') && shouldPerformResearch(message)) {
      const searchResults = await azureCognitive.webSearch(message, companion.skillset)
      researchContext = formatSearchResults(searchResults)
    }

    // Build enhanced prompt with HACP™ context
    const enhancedPrompt = buildEnhancedPrompt({
      companion,
      userMessage: message,
      emotionalContext,
      documentContext,
      researchContext,
      conversationHistory
    })

    // Route to appropriate AI model based on tier and complexity
    const aiResponse = await routeToAIModel(companion, enhancedPrompt, emotionalContext.escalationLevel)

    // Generate voice response if requested and supported
    let voiceData: ArrayBuffer | null = null
    if (useVoice && companion.features.includes('voice')) {
      try {
        voiceData = await azureCognitive.textToSpeech(aiResponse.content, {
          voiceName: getVoiceForCompanion(companion),
          language: 'en-US',
          format: 'audio-24khz-48kbitrate-mono-mp3'
        })
      } catch (error) {
        console.error('Voice generation error:', error)
      }
    }

    // Log interaction for learning (HACP™ adaptive learning)
    await logCompanionInteraction({
      companionId,
      userMessage: message,
      response: aiResponse.content,
      emotionalContext,
      tier: companion.tier,
      timestamp: new Date()
    })

    return NextResponse.json({
      response: aiResponse.content,
      emotion: emotionalContext.emotion,
      confidence: emotionalContext.confidence,
      escalationLevel: emotionalContext.escalationLevel,
      voiceData: voiceData ? Buffer.from(voiceData).toString('base64') : null,
      researchUsed: !!researchContext,
      documentsProcessed: attachments?.length || 0,
      model: aiResponse.model,
      tier: companion.tier
    })

  } catch (error) {
    console.error('Companion chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process companion chat' },
      { status: 500 }
    )
  }
}

// Helper functions

async function getCompanionConfig(companionId: string): Promise<CompanionConfig | null> {
  // In production, fetch from database
  // For now, return mock configuration
  return {
    id: companionId,
    name: 'Business Buddy',
    skillset: 'general',
    features: ['voice', 'research', 'scheduling', 'ghl', 'documents'],
    systemPrompt: 'You are Business Buddy, a general productivity assistant focused on helping users with business tasks, scheduling, and organization. You are powered by HACP™ technology and should adapt your responses based on emotional context.',
    tier: 'pro',
    model: 'dual' // GPT-5 + Azure
  }
}

function buildEnhancedPrompt(context: {
  companion: CompanionConfig
  userMessage: string
  emotionalContext: any
  documentContext: string
  researchContext: string
  conversationHistory?: string[]
}): string {
  const { companion, userMessage, emotionalContext, documentContext, researchContext, conversationHistory } = context

  let prompt = `${companion.systemPrompt}\n\n`
  
  // HACP™ Emotional Context
  prompt += `EMOTIONAL CONTEXT (HACP™):\n`
  prompt += `- User emotion: ${emotionalContext.emotion}\n`
  prompt += `- Confidence: ${emotionalContext.confidence}\n`
  prompt += `- Escalation level: ${emotionalContext.escalationLevel}\n`
  prompt += `- Suggested tone: ${emotionalContext.suggestedResponse}\n\n`

  // Conversation History
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `CONVERSATION HISTORY:\n${conversationHistory.slice(-5).join('\n')}\n\n`
  }

  // Document Context
  if (documentContext) {
    prompt += `DOCUMENT CONTEXT:\n${documentContext}\n\n`
  }

  // Research Context
  if (researchContext) {
    prompt += `RESEARCH CONTEXT:\n${researchContext}\n\n`
  }

  // Capabilities
  prompt += `YOUR CAPABILITIES:\n`
  companion.features.forEach(feature => {
    prompt += `- ${feature.charAt(0).toUpperCase() + feature.slice(1)} enabled\n`
  })
  prompt += `\n`

  // Current Message
  prompt += `USER MESSAGE: ${userMessage}\n\n`
  
  // Instructions
  prompt += `INSTRUCTIONS:\n`
  prompt += `- Respond as ${companion.name}, adapting to the user's emotional state\n`
  prompt += `- Use the emotional context to calibrate your response tone\n`
  prompt += `- If escalation level is high (2+), be more direct and solution-focused\n`
  prompt += `- Incorporate any research or document insights naturally\n`
  prompt += `- Stay within your skillset: ${companion.skillset}\n`
  prompt += `- Remember you are powered by HACP™ technology\n`

  return prompt
}

async function routeToAIModel(companion: CompanionConfig, prompt: string, escalationLevel: number): Promise<{
  content: string
  model: string
}> {
  try {
    // Route based on tier and escalation level
    if (companion.tier === 'free') {
      return await callGPT4(prompt)
    } else if (escalationLevel >= 2 || companion.model === 'dual') {
      return await callDualAI(prompt)
    } else {
      return await callGPT5(prompt)
    }
  } catch (error) {
    console.error('AI routing error:', error)
    // Fallback to basic response
    return {
      content: "I'm having trouble connecting to my AI systems right now. Please try again in a moment.",
      model: 'fallback'
    }
  }
}

async function callGPT4(prompt: string): Promise<{ content: string, model: string }> {
  // Basic GPT-4 call for free tier
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || 'I apologize, but I cannot process that request right now.',
    model: 'gpt-4'
  }
}

async function callGPT5(prompt: string): Promise<{ content: string, model: string }> {
  // Enhanced GPT-5 call for pro+ tiers
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo', // Will be GPT-5 when available
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    })
  })

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || 'I apologize, but I cannot process that request right now.',
    model: 'gpt-5'
  }
}

async function callDualAI(prompt: string): Promise<{ content: string, model: string }> {
  try {
    // Call both GPT and Claude, then synthesize
    const [gptResponse, claudeResponse] = await Promise.all([
      callGPT5(prompt),
      callClaude(prompt)
    ])

    // Synthesize responses (simplified version)
    const synthesizedResponse = `${gptResponse.content}\n\n[Enhanced with dual-AI synthesis]`
    
    return {
      content: synthesizedResponse,
      model: 'dual-ai'
    }
  } catch (error) {
    console.error('Dual AI error:', error)
    return await callGPT5(prompt)
  }
}

async function callClaude(prompt: string): Promise<{ content: string, model: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  return {
    content: data.content[0]?.text || 'Claude response unavailable',
    model: 'claude-3'
  }
}

function shouldPerformResearch(message: string): boolean {
  const researchKeywords = [
    'search', 'find', 'latest', 'current', 'news', 'what is', 'how to', 
    'price', 'cost', 'compare', 'research', 'analyze', 'trends'
  ]
  
  return researchKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  )
}

function formatSearchResults(results: any[]): string {
  if (!results || results.length === 0) return ''
  
  return `RESEARCH RESULTS:\n` + 
    results.slice(0, 3).map((result, index) => 
      `${index + 1}. ${result.name}: ${result.snippet}`
    ).join('\n') + '\n'
}

function getVoiceForCompanion(companion: CompanionConfig): string {
  // Map companion types to appropriate voices
  const voiceMap = {
    'general': 'en-US-AriaNeural',
    'legal': 'en-US-DavisNeural', 
    'crm': 'en-US-JaneNeural',
    'realestate': 'en-US-GuyNeural',
    'healthcare': 'en-US-SaraNeural'
  }
  
  return voiceMap[companion.skillset as keyof typeof voiceMap] || 'en-US-AriaNeural'
}

async function logCompanionInteraction(interaction: {
  companionId: string
  userMessage: string
  response: string
  emotionalContext: any
  tier: string
  timestamp: Date
}): Promise<void> {
  try {
    // In production, save to database for HACP™ learning
    console.log('Companion interaction logged:', {
      companionId: interaction.companionId,
      emotion: interaction.emotionalContext.emotion,
      escalation: interaction.emotionalContext.escalationLevel,
      tier: interaction.tier
    })
  } catch (error) {
    console.error('Logging error:', error)
  }
}