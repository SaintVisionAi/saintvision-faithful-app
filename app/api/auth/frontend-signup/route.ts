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

    console.log('Creating user via direct HTTP to Supabase Auth API...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

    // Direct HTTP request to Supabase Auth API (bypasses database schema issues)
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
      }
    })

  } catch (error: any) {
    console.error('Frontend signup error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}