import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Signing in user...')

    // Use the anon key for sign in (not service role key)
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )

    const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Sign in error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Sign in failed' },
        { status: 401 }
      )
    }

    // Try to get user profile
    let userProfile = null
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (!profileError) {
        userProfile = profile
      }
    } catch (profileError) {
      console.error('Profile fetch error (non-critical):', profileError)
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
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      }
    })

  } catch (error: any) {
    console.error('Complete signin error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}