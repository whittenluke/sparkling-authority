import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        // Read-only: do not modify cookies in Server Components (not allowed in App Router).
        // Session refresh is persisted in Route Handlers (e.g. auth callback) and middleware.
        async set(_name: string, _value: string, _options: CookieOptions) {
          // no-op
        },
        async remove(_name: string, _options: CookieOptions) {
          // no-op
        }
      }
    }
  )
}

// Keep old export for backward compatibility if needed
export const createServerComponentClient = createClient 