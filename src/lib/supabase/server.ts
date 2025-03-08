import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'

type CookieOptions = {
  name: string
  value: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  path?: string
  domain?: string
  sameSite?: 'strict' | 'lax' | 'none'
}

export function createClient() {
  return createServerComponentClient<Database>({
    cookies
  })
} 