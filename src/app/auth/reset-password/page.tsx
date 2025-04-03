'use client'

import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | Sparkling Authority',
  description: 'Reset your Sparkling Authority account password securely.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Your Password
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your new password below. Make sure it&apos;s secure and easy to remember.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <ResetPasswordForm />
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Remember your password?{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in here
          </a>
        </p>
        <p className="mt-2">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-primary hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
} 