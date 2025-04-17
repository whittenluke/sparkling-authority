import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  // Get the host from the request
  const host = request.headers.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value
          },
          async set(name: string, value: string, options: CookieOptions) {
            (await cookieStore).set({ name, value, ...options })
          },
          async remove(name: string, options: CookieOptions) {
            (await cookieStore).set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Create profile if it doesn't exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // Create profile with username from email
        const username = session.user.email?.split('@')[0] || 'user'
        await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            username: username,
            display_name: username,
            is_admin: false,
            reputation_score: 0
          })
      }

      // Use the baseUrl for the redirect
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }

  // Return to home page if something went wrong
  return NextResponse.redirect(new URL('/', baseUrl))
} 