'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/supabase/client'
import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Update Password | Sparkling Authority',
  description: 'Update your Sparkling Authority account password securely.',
  robots: {
    index: false,
    follow: false,
  },
}

interface ErrorState {
  message: string;
  code?: string;
}

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
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Update Your Password
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your current password and choose a new one.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <UpdatePasswordForm />
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

      <div className="text-center mt-4">
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90">
          Back to login
        </Link>
      </div>
    </div>
  )
} 