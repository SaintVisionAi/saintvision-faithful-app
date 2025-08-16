import { NextRequest, NextResponse } from 'next/server'
import { SAINT_DR_SYSTEM_PROMPT, getActiveModules, buildEnhancedPrompt } from '@/lib/agents/saintDrPrompt'

interface ChatRequest {
  message: string
  agentId: string
  mode: 'ryan' | 'execution'
  conversationHistory?: string[]
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { message, agentId, mode, conversationHistory }: ChatRequest = await request.json()
    
    // Detect active intelligence modules based on message content
    const activeModules = getActiveModules(message)
    
    // Build enhanced prompt with active modules
    const enhancedPrompt = buildEnhancedPrompt(SAINT_DR_SYSTEM_PROMPT, activeModules, mode)
    
    // Add conversation context
    let contextualPrompt = enhancedPrompt
    if (conversationHistory && conversationHistory.length > 0) {
      contextualPrompt += `\n\nCONVERSATION HISTORY:\n${conversationHistory.slice(-3).join('\n')}\n\n`
    }
    
    contextualPrompt += `USER MESSAGE: ${message}\n\nRESPONSE:`
    
    // Call AI model (GPT-4 for production)
    const aiResponse = await callAIModel(contextualPrompt, mode)
    
    return NextResponse.json({
      response: aiResponse.content,
      activeModules: activeModules,
      mode: mode,
      agentId: agentId
    })

  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process agent chat' },
      { status: 500 }
    )
  }
}

async function callAIModel(prompt: string, mode: string): Promise<{ content: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: mode === 'ryan' ? 800 : 1000,
        temperature: mode === 'ryan' ? 0.8 : 0.7
      })
    })

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || 'I understand. Let me think about that.'
    }
  } catch (error) {
    console.error('AI model error:', error)
    return {
      content: 'I need a moment to reconnect. Please try again.'
    }
  }
}