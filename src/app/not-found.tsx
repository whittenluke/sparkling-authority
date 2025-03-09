import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-lg text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-6">
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Go back home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 