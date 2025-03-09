import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Page not found
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 