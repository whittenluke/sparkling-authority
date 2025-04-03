'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">500</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Something went wrong. Our team has been notified.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-md bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/80"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 