'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      
      if (error) {
        throw error
      }
      
      setSuccess(true)
    } catch (err) {
      console.error('Password reset error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Failed to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
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
            If an account exists with that email, we&apos;ve sent password reset instructions. Please check your inbox.
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
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