import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function refreshToken(refreshToken) {
  try {
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'Calendars.Read Mail.Read offline_access'
      })
    })

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

export async function POST(request) {
  try {
    const userId = process.env.USER_ID || 'default-user'

    // Get stored tokens
    const { data: tokenData } = await supabase
      .from('microsoft_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Microsoft not connected' },
        { status: 401 }
      )
    }

    let accessToken = tokenData.access_token

    // Check if token expired
    if (new Date(tokenData.expires_at) < new Date()) {
      accessToken = await refreshToken(tokenData.refresh_token)
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Token refresh failed' },
          { status: 401 }
        )
      }

      // Update stored token
      await supabase
        .from('microsoft_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        })
        .eq('user_id', userId)
    }

    // Fetch events from Microsoft Graph
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events?$top=50&$orderby=start/dateTime desc',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    const calendarData = await response.json()

    if (!calendarData.value) {
      return NextResponse.json(
        { error: 'Failed to fetch calendar' },
        { status: 400 }
      )
    }

    // Save events to database
    for (const event of calendarData.value) {
      await supabase
        .from('calendar_events')
        .upsert({
          user_id: userId,
          microsoft_id: event.id,
          title: event.subject,
          start_time: event.start?.dateTime,
          end_time: event.end?.dateTime,
          description: event.bodyPreview,
          attendees: event.attendees?.map(a => a.emailAddress),
          synced_at: new Date().toISOString()
        })
    }

    console.log(`[CALENDAR] Synced ${calendarData.value.length} events for ${userId}`)

    return NextResponse.json({
      ok: true,
      events: calendarData.value.length
    })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
