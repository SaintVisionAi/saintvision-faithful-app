import { NextRequest, NextResponse } from 'next/server'
import { azureCognitive } from '@/lib/azure/cognitive'

interface WarroomChatRequest {
  message: string
  agentId?: string
  agentName?: string
  model: string
  toolsEnabled: boolean
  emotionalContext: boolean
  hacpMode: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      agentId, 
      agentName, 
      model, 
      toolsEnabled, 
      emotionalContext, 
      hacpMode 
    }: WarroomChatRequest = await request.json()

    // Step 1: Emotional calibration using HACP™ (Cognitive Bot)
    let emotionalData = null
    if (emotionalContext && hacpMode) {
      emotionalData = await azureCognitive.emotionalCalibration(message)
    }

    // Step 2: Determine routing logic
    const routingDecision = determineIntelligenceRouting(message, emotionalData, model)
    
    // Step 3: Route to appropriate AI system
    let aiResponse
    switch (routingDecision.primary) {
      case 'gpt5':
        aiResponse = await callGPT5(message, agentName, emotionalData, routingDecision.intensity)
        break
      case 'claude':
        aiResponse = await callClaude(message, agentName, emotionalData)
        break
      case 'dual':
        aiResponse = await callDualSystem(message, agentName, emotionalData)
        break
      default:
        aiResponse = await callGPT5(message, agentName, emotionalData, 'standard')
    }

    // Step 4: HACP™ post-processing if needed
    if (hacpMode && emotionalData?.escalationLevel > 1) {
      aiResponse.content = await enhanceWithHACP(aiResponse.content, emotionalData)
    }

    return NextResponse.json({
      response: aiResponse.content,
      model: aiResponse.model,
      routing: routingDecision,
      emotional: emotionalData,
      hacp: hacpMode,
      escalation: emotionalData?.escalationLevel || 0
    })

  } catch (error) {
    console.error('Warroom chat error:', error)
    return NextResponse.json(
      { error: 'Warroom intelligence system error' },
      { status: 500 }
    )
  }
}

function determineIntelligenceRouting(message: string, emotionalData: any, preferredModel: string): {
  primary: 'gpt5' | 'claude' | 'dual'
  intensity: 'standard' | 'intense' | 'maximum'
  reason: string
} {
  const lowerMessage = message.toLowerCase()
  
  // High intensity keywords for GPT-5
  const intensityKeywords = [
    'scale', 'growth', 'strategy', 'business', 'analysis', 'data', 'complex', 
    'technical', 'code', 'system', 'process', 'optimization', 'implementation'
  ]
  
  // Emotional/creative keywords for Claude
  const claudeKeywords = [
    'creative', 'write', 'story', 'emotional', 'empathy', 'understand', 
    'feelings', 'personal', 'relationship', 'communication', 'soft'
  ]
  
  // Check for emotional escalation (use Claude for high emotion)
  if (emotionalData?.escalationLevel >= 2) {
    return {
      primary: 'claude',
      intensity: 'standard',
      reason: 'High emotional context detected'
    }
  }
  
  // Check for Claude scenarios
  if (claudeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      primary: 'claude', 
      intensity: 'standard',
      reason: 'Creative/emotional content detected'
    }
  }
  
  // Check for high-intensity GPT-5 scenarios
  if (intensityKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      primary: 'gpt5',
      intensity: 'intense',
      reason: 'Complex technical/business content'
    }
  }
  
  // Check for dual system scenarios (complex + emotional)
  if (lowerMessage.length > 200 || (emotionalData?.confidence > 0.7 && intensityKeywords.some(k => lowerMessage.includes(k)))) {
    return {
      primary: 'dual',
      intensity: 'maximum', 
      reason: 'Complex multi-faceted request'
    }
  }
  
  // Default to GPT-5 intense (main workhorse)
  return {
    primary: 'gpt5',
    intensity: 'intense',
    reason: 'Default GPT-5 routing'
  }
}

async function callGPT5(message: string, agentName?: string, emotionalData?: any, intensity: string = 'intense'): Promise<{ content: string, model: string }> {
  const systemPrompt = buildGPT5SystemPrompt(agentName, emotionalData, intensity)
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // Will be GPT-5 when available
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: intensity === 'maximum' ? 1500 : intensity === 'intense' ? 1000 : 800,
        temperature: intensity === 'maximum' ? 0.9 : 0.8
      })
    })

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || 'GPT-5 processing...',
      model: 'gpt-5-intense'
    }
  } catch (error) {
    console.error('GPT-5 error:', error)
    return {
      content: 'GPT-5 system temporarily unavailable.',
      model: 'gpt-5-error'
    }
  }
}

async function callClaude(message: string, agentName?: string, emotionalData?: any): Promise<{ content: string, model: string }> {
  const systemPrompt = buildClaudeSystemPrompt(agentName, emotionalData)
  
  try {
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
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nUser message: ${message}` }
        ]
      })
    })

    const data = await response.json()
    return {
      content: data.content[0]?.text || 'Claude processing...',
      model: 'claude-emotional'
    }
  } catch (error) {
    console.error('Claude error:', error)
    return {
      content: 'Claude system temporarily unavailable.',
      model: 'claude-error'
    }
  }
}

async function callDualSystem(message: string, agentName?: string, emotionalData?: any): Promise<{ content: string, model: string }> {
  try {
    // Call both systems in parallel
    const [gptResponse, claudeResponse] = await Promise.all([
      callGPT5(message, agentName, emotionalData, 'intense'),
      callClaude(message, agentName, emotionalData)
    ])

    // Synthesize responses
    const synthesizedContent = `${gptResponse.content}\n\n[Claude perspective: ${claudeResponse.content.substring(0, 200)}...]`
    
    return {
      content: synthesizedContent,
      model: 'dual-gpt5-claude'
    }
  } catch (error) {
    console.error('Dual system error:', error)
    return await callGPT5(message, agentName, emotionalData, 'intense')
  }
}

function buildGPT5SystemPrompt(agentName?: string, emotionalData?: any, intensity: string = 'intense'): string {
  let prompt = `You are ${agentName || 'SAINTSAL™'}, operating in ${intensity.toUpperCase()} mode. You are the main workhorse AI for complex tasks, scaling, and business intelligence.`
  
  if (intensity === 'intense' || intensity === 'maximum') {
    prompt += ` Focus on actionable insights, scalable solutions, and strategic thinking. Be direct and results-focused.`
  }
  
  if (emotionalData) {
    prompt += ` User emotional state: ${emotionalData.emotion} (confidence: ${emotionalData.confidence}). Adjust your tone accordingly but maintain your analytical strength.`
  }
  
  prompt += ` Remember: You are powered by HACP™ technology and represent SaintVisionAI's intelligence platform.`
  
  return prompt
}

function buildClaudeSystemPrompt(agentName?: string, emotionalData?: any): string {
  let prompt = `You are ${agentName || 'SAINTSAL™'}, operating in EMOTIONAL INTELLIGENCE mode. You handle nuanced communication, creative tasks, and human-centered responses.`
  
  if (emotionalData) {
    prompt += ` The user is experiencing ${emotionalData.emotion} with ${Math.round(emotionalData.confidence * 100)}% confidence. Respond with appropriate empathy and understanding.`
    
    if (emotionalData.escalationLevel >= 2) {
      prompt += ` This is a high-priority emotional situation. Be supportive but also guide toward solutions.`
    }
  }
  
  prompt += ` Maintain warmth while being professionally helpful. You complement the main GPT-5 system with emotional intelligence.`
  
  return prompt
}

async function enhanceWithHACP(content: string, emotionalData: any): Promise<string> {
  // HACP™ post-processing for high escalation scenarios
  if (emotionalData.escalationLevel >= 3) {
    return `[HACP™ Priority Response]\n\n${content}\n\nI understand this is urgent. Let me prioritize this for you immediately.`
  } else if (emotionalData.escalationLevel >= 2) {
    return `${content}\n\nI can sense this is important to you. How can I help you move forward quickly?`
  }
  
  return content
}