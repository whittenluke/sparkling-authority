'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check if user has a valid session from password reset email
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If no session, redirect to login
        router.push('/auth/login')
      }
    }

    checkSession()
  }, [router, supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // After successful password update, redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err) {
      console.error('Password update error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Update your password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/10 p-4">
          <div className="text-sm text-green-800 dark:text-green-300">
            Your password has been updated successfully! Redirecting to login...
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90">
          Back to login
        </Link>
      </div>
    </div>
  )
} 