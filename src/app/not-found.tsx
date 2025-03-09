import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
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
      </main>
      <Footer />
    </div>
  )
} 