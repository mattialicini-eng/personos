import { NextResponse } from 'next/server'

const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'changeme'
const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password richiesta' },
        { status: 400 }
      )
    }

    if (password !== LOGIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Password errata' },
        { status: 401 }
      )
    }

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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
