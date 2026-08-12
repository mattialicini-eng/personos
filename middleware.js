import { NextResponse } from 'next/server'

const publicRoutes = ['/login', '/api/login', '/api/init']
const webhookRoutes = ['/api/webhook']

export function middleware(request) {
  const path = request.nextUrl.pathname

  // Webhook routes bypass auth
  if (webhookRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Public routes bypass auth
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // Check for valid auth cookie
  const cookie = request.cookies.get('auth')
  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify cookie signature
  const signature = cookie.value.split('.')[1]
  const payload = cookie.value.split('.')[0]
  const expectedSig = Buffer.from(
    payload + (process.env.AUTH_SECRET || 'dev')
  ).toString('base64')

  if (signature !== expectedSig) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
