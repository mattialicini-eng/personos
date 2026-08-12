import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const clientId = process.env.MICROSOFT_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`
    const scope = 'Calendars.Read Mail.Read offline_access'

    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common'
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`)
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', scope)
    authUrl.searchParams.append('response_mode', 'query')

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Microsoft auth start error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
