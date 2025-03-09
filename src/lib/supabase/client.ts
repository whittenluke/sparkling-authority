'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClientComponentClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 