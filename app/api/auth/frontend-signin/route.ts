import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Signing in user via direct HTTP to Supabase...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

    // Direct HTTP request to Supabase Auth API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const authData = await authResponse.json()
    console.log('Sign in response:', authResponse.status, authData)

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: authData.error_description || authData.msg || 'Sign in failed' },
        { status: authResponse.status }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Sign in failed - no user data' },
        { status: 401 }
      )
    }

    console.log('Sign in successful!')

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: authData.user.user_metadata?.full_name || '',
        phoneNumber: authData.user.user_metadata?.phone_number || null,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
      },
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: authData.expires_at,
      }
    })

  } catch (error: any) {
    console.error('Frontend signin error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}