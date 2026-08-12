import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/store'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendBriefingEmail(email, html) {
  try {
    await resend.emails.send({
      from: 'PersonOS <noreply@resend.dev>',
      to: email,
      subject: '📊 PersonOS - Briefing giornaliero',
      html: html
    })
    console.log(`[EMAIL] Briefing sent to ${email}`)
    return true
  } catch (error) {
    console.error('Briefing email error:', error)
    return false
  }
}

export async function GET(request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const userId = process.env.USER_ID || 'default-user'
    const profile = await getProfile(userId)

    if (!profile?.email) {
      return NextResponse.json({
        ok: true,
        message: 'No email configured',
        processed: 0
      })
    }

    // Generate briefing HTML
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/briefing/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email: profile.email,
        date: new Date().toISOString().split('T')[0]
      })
    })

    const briefing = await response.json()

    if (!briefing.ok) {
      throw new Error(briefing.error)
    }

    // Send email
    await sendBriefingEmail(profile.email, briefing.html)

    // Log in registry
    await supabase
      .from('registry')
      .insert({
        user_id: userId,
        action: 'briefing_sent',
        entity_type: 'briefing',
        entity_id: new Date().toISOString().split('T')[0],
        details: { email: profile.email }
      })

    return NextResponse.json({
      ok: true,
      message: 'Briefing sent',
      email: profile.email,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Daily briefing cron error:', error)
    return NextResponse.json(
      { error: error.message, ok: false },
      { status: 500 }
    )
  }
}
