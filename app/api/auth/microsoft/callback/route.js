import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=${error}`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`)
    }

    // Exchange code for tokens
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`,
        grant_type: 'authorization_code',
        scope: 'Calendars.Read Mail.Read offline_access'
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=token_failed`)
    }

    // Save tokens to Supabase
    const userId = process.env.USER_ID || 'default-user'
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    const { error: dbError } = await supabase
      .from('microsoft_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=db_error`)
    }

    console.log(`[MICROSOFT] Connected for user ${userId}`)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?microsoft=connected`)
  } catch (error) {
    console.error('Microsoft callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=callback_error`)
  }
}
