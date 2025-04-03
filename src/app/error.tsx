'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <div className="text-center">
      <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">500</h2>
      <p className="mt-4 text-base text-muted-foreground">Something went wrong.</p>
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
  )
} 