import { createClientComponentClient } from './client'

export async function isAdmin(email: string | undefined | null): Promise<boolean> {
  try {
    if (!email) return false
    
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single()

    if (error) {
      // Only log actual errors, not "no rows returned"
      if (error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error)
      }
      return false
    }

    return !!data
  } catch (err) {
    // Log any unexpected errors
    console.error('Unexpected error checking admin status:', err)
    return false
  }
} 