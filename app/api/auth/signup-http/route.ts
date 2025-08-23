import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

    console.log('Creating user via direct HTTP to Supabase Auth API...')

    // Direct HTTP request to Supabase Auth API
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
          full_name: fullName || '',
        }
      }),
    })

    const authData = await authResponse.json()
    console.log('Auth response:', authResponse.status, authData)

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: authData.error_description || authData.msg || 'Auth failed' },
        { status: authResponse.status }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user returned from auth' },
        { status: 500 }
      )
    }

    console.log('User created successfully via HTTP!')

    // Now create profile using direct REST API
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
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
        display_name: fullName || '',
        username: email.split('@')[0],
        role: 'user',
        plan: 'free',
        has_onboarded: false,
        user_id: authData.user.id,
      }),
    })

    console.log('Profile response:', profileResponse.status)

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text()
      console.error('Profile creation failed:', profileError)
    }

    // Create AI agent
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

    console.log('Agent response:', agentResponse.status)

    return NextResponse.json({
      message: 'User created successfully with direct HTTP API calls',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName || '',
      },
      auth: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      }
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}