import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phoneNumber } = await request.json()

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    console.log('Creating user with complete profile...')

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        phone_number: phoneNumber || '',
      },
      email_confirm: false, // Will be verified via email
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      
      if (authError.message.includes('weak_password') || authError.message.includes('weak')) {
        return NextResponse.json(
          { error: 'Password too weak. Use a unique, strong password with letters, numbers, and symbols.' },
          { status: 400 }
        )
      }
      
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

    console.log('User created successfully, creating profile...')

    // Try to create profile (this might fail if table doesn't exist, but user auth will still work)
    let profileCreated = false
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          display_name: fullName,
          username: email.split('@')[0],
          phone_number: phoneNumber || null,
          role: 'user',
          plan: 'free',
          has_onboarded: false,
          user_id: authData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Profile creation error (non-critical):', profileError)
      } else {
        profileCreated = true
        console.log('Profile created successfully')
      }
    } catch (profileError) {
      console.error('Profile creation failed (non-critical):', profileError)
    }

    // Try to create AI agent (optional)
    try {
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
        console.error('Agent creation error (non-critical):', agentError)
      } else {
        console.log('AI agent created successfully')
      }
    } catch (agentError) {
      console.error('Agent creation failed (non-critical):', agentError)
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName,
        phoneNumber: phoneNumber || null,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
      },
      profileCreated,
    })

  } catch (error: any) {
    console.error('Complete signup error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}