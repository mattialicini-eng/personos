import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret'

export async function POST(request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e codice richiesti' },
        { status: 400 }
      )
    }

    // Find code in database
    const { data, error } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Codice errato o scaduto' },
        { status: 401 }
      )
    }

    // Mark code as used
    await supabase
      .from('auth_codes')
      .update({ used: true })
      .eq('id', data.id)

    // Create signed cookie
    const payload = Buffer.from(Date.now().toString()).toString('base64')
    const signature = Buffer.from(
      payload + AUTH_SECRET
    ).toString('base64')
    const cookieValue = `${payload}.${signature}`

    const response = NextResponse.json({ ok: true })
    response.cookies.set('auth', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}
