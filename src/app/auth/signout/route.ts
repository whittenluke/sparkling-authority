import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AUTH_COOKIE_PREFIX = 'supabase.auth.token'

/** GET /auth/signout — clear Supabase auth cookies by name and redirect. Fixes cookie persistence on test/dev where client signOut doesn't clear. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const response = NextResponse.redirect(new URL('/', url.origin))

  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const names = cookieHeader.split(';').map((p) => p.trim().split('=')[0]?.trim()).filter(Boolean)
    const clearOptions = { path: '/', maxAge: 0 }
    for (const name of names) {
      if (name === AUTH_COOKIE_PREFIX || name.startsWith(AUTH_COOKIE_PREFIX + '.') || name.startsWith(AUTH_COOKIE_PREFIX + '-')) {
        response.cookies.set(name, '', clearOptions)
      }
    }
  }

  return response
}
