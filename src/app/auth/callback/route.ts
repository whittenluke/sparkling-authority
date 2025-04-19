import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

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
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Session exchange error:', error.message)
      return NextResponse.redirect(new URL('/', baseUrl))
    }

    if (!session?.user) {
      console.error('No session or user after code exchange')
      return NextResponse.redirect(new URL('/', baseUrl))
    }

    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (!profile) {
        const username = session.user.email?.split('@')[0] || 'user'
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            username: username,
            display_name: username,
            is_admin: false,
            reputation_score: 0
          })

        if (insertError) {
          throw insertError
        }
      }

      return NextResponse.redirect(new URL(next, baseUrl))
    } catch (err) {
      console.error('Profile creation error:', err)
      return NextResponse.redirect(new URL('/', baseUrl))
    }
  }

  // Return to home page if something went wrong
  return NextResponse.redirect(new URL('/', baseUrl))
} 