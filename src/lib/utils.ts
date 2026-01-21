import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createClientComponentClient } from '@/lib/supabase/client' // Import Supabase client

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/-+/g, '-')       // Multiple hyphens to single
    .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
}

export async function ensureUniqueSlug(initialSlug: string, tableName: string): Promise<string> {
  const supabase = createClientComponentClient() // Use the client-side Supabase client
  let finalSlug = initialSlug
  let counter = 1
  const maxAttempts = 100 // Prevent infinite loops

  while (counter <= maxAttempts) {
    const { data, error } = await supabase
      .from(tableName)
      .select('slug')
      .eq('slug', finalSlug)
      .maybeSingle() // Use maybeSingle instead of single to avoid errors

    // If error exists and it's not "no rows found", throw
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check slug uniqueness: ${error.message}`)
    }

    // If no data, slug is unique
    if (!data) {
      return finalSlug
    }

    // Slug exists, try next iteration
    finalSlug = `${initialSlug}-${counter}`
    counter++
  }

  throw new Error('Unable to generate unique slug after maximum attempts')
}