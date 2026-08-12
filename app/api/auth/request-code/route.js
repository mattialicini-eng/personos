import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendEmail(email, code) {
  try {
    await resend.emails.send({
      from: 'PersonOS <noreply@resend.dev>',
      to: email,
      subject: 'PersonOS - Codice di verifica',
      html: `
        <div style="font-family: sans-serif; max-width: 400px;">
          <h2>PersonOS - Verifica identità</h2>
          <p>Il tuo codice di verifica è:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</span>
          </div>
          <p style="color: #666; font-size: 12px;">Questo codice scade tra 10 minuti.</p>
        </div>
      `
    })
    console.log(`[EMAIL] OTP sent to ${email}`)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password richiesti' },
        { status: 400 }
      )
    }

    // Verify password
    if (password !== process.env.LOGIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Password errata' },
        { status: 401 }
      )
    }

    // Generate code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save to database
    const { error } = await supabase
      .from('auth_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Errore nel salvataggio del codice' },
        { status: 500 }
      )
    }

    // Send email
    await sendEmail(email, code)

    return NextResponse.json({
      ok: true,
      message: 'Codice inviato via email',
      email: email.substring(0, 2) + '*'.repeat(email.length - 4) + email.substring(email.length - 2)
    })
  } catch (error) {
    console.error('Request code error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
