import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication - SparklingAuthority',
  description: 'Sign in or register for SparklingAuthority, your guide to sparkling water.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-primary">SparklingAuthority</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Your guide to sparkling water
          </p>
        </div>
        {children}
      </div>
    </div>
  )
} 