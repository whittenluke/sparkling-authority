import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">404</h2>
        <p className="mt-4 text-base text-muted-foreground">Page not found.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Go back home
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 