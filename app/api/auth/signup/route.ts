import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName || '',
      },
      email_confirm: true, // Auto-confirm email for demo
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName || '',
        subscription_status: 'free',
        subscription_plan: 'free',
        agent_limit: 1,
        conversation_limit: 10,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup, just log the error
    }

    // Create default AI agent for new user
    const { error: agentError } = await supabase
      .from('ai_agents')
      .insert({
        user_id: authData.user.id,
        name: 'SAL Assistant',
        type: 'companion',
        model: 'claude-opus-4',
        system_prompt: 'You are SAL, a helpful AI assistant from SAINTVISIONAI. You are powered by the HACP™ protocol and provide intelligent, thoughtful responses.',
        personality: 'Professional, helpful, and intelligent',
        capabilities: ['conversation', 'analysis', 'creativity', 'problem-solving'],
      })

    if (agentError) {
      console.error('Agent creation error:', agentError)
      // Don't fail the signup, just log the error
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName || '',
      },
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}