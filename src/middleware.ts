import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/community/reviews/submit',
  '/community/products/submit'
]

export async function middleware(request: NextRequest) {
  // Create response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If it's a protected route and user is not logged in
  if (isProtectedRoute && !session) {
    // Create the login URL with the return path
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    
    // Use 307 Temporary Redirect to preserve the request method
    return NextResponse.redirect(loginUrl, 307)
  }

  return response
}

// Update matcher to include specific routes we want to protect
export const config = {
  matcher: [
    '/community/reviews/submit',
    '/community/products/submit',
    '/auth/login'
  ]
} 