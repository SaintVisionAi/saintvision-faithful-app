import { NextRequest, NextResponse } from 'next/server'

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

    console.log('Creating user with production-ready authentication...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

    // Direct HTTP request to Supabase Auth API (most reliable method)
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName,
          phone_number: phoneNumber || '',
          display_name: fullName,
          role: 'user',
          plan: 'free',
        }
      }),
    })

    const authData = await authResponse.json()
    console.log('Auth response:', authResponse.status, authData)

    if (!authResponse.ok) {
      if (authData.error_code === 'weak_password') {
        return NextResponse.json(
          { error: 'Password too weak. Use a unique, strong password with letters, numbers, and symbols.' },
          { status: 400 }
        )
      }
      
      if (authData.error_code === 'email_taken' || authData.msg?.includes('already registered')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authData.error_description || authData.msg || 'Authentication failed' },
        { status: authResponse.status }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user returned from authentication' },
        { status: 500 }
      )
    }

    console.log('User created successfully!')

    // Attempt to create profile in user_profiles table (RLS-enabled)
    // This will work if your RLS policies allow it, but won't fail the signup if not
    let profileCreated = false
    try {
      if (authData.access_token) {
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${authData.access_token}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: authData.user.id,
            email: authData.user.email,
            display_name: fullName,
            username: email.split('@')[0],
            phone_number: phoneNumber || null,
            role: 'user',
            plan: 'free',
            has_onboarded: false,
            user_id: authData.user.id,
          }),
        })

        if (profileResponse.ok) {
          profileCreated = true
          console.log('Profile created in user_profiles table')
        } else {
          const profileError = await profileResponse.text()
          console.log('Profile creation info:', profileResponse.status, profileError)
        }
      }
    } catch (profileError) {
      console.log('Profile creation attempted (non-critical):', profileError)
    }

    // Attempt to create AI agent
    let agentCreated = false
    try {
      if (authData.access_token) {
        const agentResponse = await fetch(`${supabaseUrl}/rest/v1/ai_agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${authData.access_token}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: authData.user.id,
            name: 'SAL Assistant',
            type: 'companion',
            model: 'claude-opus-4',
            system_prompt: 'You are SAL, a helpful AI assistant from SAINTVISIONAI powered by the HACP™ protocol.',
            personality: 'Professional, helpful, and intelligent',
            capabilities: ['conversation', 'analysis', 'creativity', 'problem-solving'],
            is_active: true,
          }),
        })

        if (agentResponse.ok) {
          agentCreated = true
          console.log('AI agent created successfully')
        } else {
          const agentError = await agentResponse.text()
          console.log('Agent creation info:', agentResponse.status, agentError)
        }
      }
    } catch (agentError) {
      console.log('Agent creation attempted (non-critical):', agentError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName,
        phoneNumber: phoneNumber || null,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
      },
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      },
      profileCreated,
      agentCreated,
    })

  } catch (error: any) {
    console.error('Production signup error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}