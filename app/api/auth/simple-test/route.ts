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

    // Direct HTTP call to Supabase Auth API (bypassing client libraries)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

    console.log('Testing direct Supabase signup via HTTP...')

    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
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

    const data = await response.json()
    console.log('Supabase response:', response.status, data)

    return NextResponse.json({
      status: response.status,
      supabaseResponse: data,
      success: response.ok,
    })

  } catch (error: any) {
    console.error('Simple test error:', error)
    return NextResponse.json(
      { error: `Test failed: ${error.message}` },
      { status: 500 }
    )
  }
}