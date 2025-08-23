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

    console.log('Signing in user with production authentication...')

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
    console.log('Sign in response:', authResponse.status)

    if (!authResponse.ok) {
      if (authData.error === 'invalid_credentials' || authData.error_description?.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'Invalid email or password. Please check your credentials and try again.' },
          { status: 401 }
        )
      }
      
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

    // Try to get user profile from user_profiles table
    let userProfile = null
    try {
      if (authData.access_token) {
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${authData.user.id}`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${authData.access_token}`,
          },
        })

        if (profileResponse.ok) {
          const profiles = await profileResponse.json()
          if (profiles && profiles.length > 0) {
            userProfile = profiles[0]
            console.log('Profile retrieved from user_profiles table')
          }
        }
      }
    } catch (profileError) {
      console.log('Profile retrieval attempted (non-critical):', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: userProfile?.display_name || authData.user.user_metadata?.full_name || '',
        phoneNumber: userProfile?.phone_number || authData.user.user_metadata?.phone_number || null,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        profile: userProfile,
      },
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: authData.expires_at,
      }
    })

  } catch (error: any) {
    console.error('Production signin error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}