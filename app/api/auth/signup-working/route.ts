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

    console.log('Creating user with existing table structure...')

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName || '',
      },
      email_confirm: true,
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

    console.log('User created, now creating profile...')

    // Use existing 'profiles' table instead of 'user_profiles'
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email!,
        display_name: fullName || '',
        username: email.split('@')[0],
        role: 'user',
        plan: 'free',
        has_onboarded: false,
        user_id: authData.user.id,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log('Profile created, now creating AI agent...')

    // Create AI agent using existing table
    const { error: agentError } = await supabase
      .from('ai_agents')
      .insert({
        user_id: authData.user.id,
        name: 'SAL Assistant',
        type: 'companion',
        model: 'claude-opus-4',
        system_prompt: 'You are SAL, a helpful AI assistant from SAINTVISIONAI powered by the HACP™ protocol.',
        personality: 'Professional, helpful, and intelligent',
        capabilities: ['conversation', 'analysis', 'creativity', 'problem-solving'],
        is_active: true,
      })

    if (agentError) {
      console.error('Agent creation error:', agentError)
      // Don't fail signup for this
    }

    return NextResponse.json({
      message: 'User created successfully with existing database structure',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName || '',
      },
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}