import { NextRequest, NextResponse } from 'next/server'
import { SAINT_DR_SYSTEM_PROMPT, getActiveModules, buildEnhancedPrompt } from '@/lib/agents/saintDrPrompt'

interface CreateAgentRequest {
  name: string
  type: 'saint-dr' | 'custom'
  mode: 'ryan' | 'execution'
  modules: string[]
  userId?: string
  teamId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, mode, modules, userId, teamId }: CreateAgentRequest = await request.json()
    
    // Generate agent ID
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Build system prompt based on type and modules
    let systemPrompt = SAINT_DR_SYSTEM_PROMPT
    if (modules && modules.length > 0) {
      systemPrompt = buildEnhancedPrompt(SAINT_DR_SYSTEM_PROMPT, modules, mode)
    }
    
    // Create agent configuration
    const agent = {
      id: agentId,
      name: name,
      type: type,
      mode: mode,
      systemPrompt: systemPrompt,
      modules: modules || [],
      userId: userId,
      teamId: teamId,
      created: new Date().toISOString(),
      status: 'active',
      endpoint: `/api/agents/${agentId}/chat`,
      previewUrl: `/agents/${agentId}`,
      consoleUrl: `/console?agent=${agentId}`
    }
    
    // In production, save to Supabase
    // await saveAgentToRegistry(agent)
    
    return NextResponse.json({
      success: true,
      agent: agent,
      message: `${name} created successfully`
    })
    
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}

// Helper function for Supabase integration
async function saveAgentToRegistry(agent: any) {
  // TODO: Implement Supabase save
  // const { data, error } = await supabase
  //   .from('agents')
  //   .insert([agent])
  console.log('Agent saved to registry:', agent.id)
}