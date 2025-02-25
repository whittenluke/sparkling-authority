import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Your Guide to Sparkling Water
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Discover the best sparkling waters, read expert reviews, and join our community of enthusiasts.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/reviews"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Browse Reviews
                  </Link>
                  <Link href="/guides" className="text-sm font-semibold leading-6 text-gray-900">
                    Read Our Guides <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Sections */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Latest Reviews */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Latest Reviews</h2>
          <p className="mt-2 text-sm text-gray-600">
            See what our community thinks about the newest sparkling waters.
          </p>
          <Link
            href="/reviews"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all reviews
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Featured Brands */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Featured Brands</h2>
          <p className="mt-2 text-sm text-gray-600">
            Explore our curated selection of top sparkling water brands.
          </p>
          <Link
            href="/brands"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Browse brands
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Expert Guides */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Expert Guides</h2>
          <p className="mt-2 text-sm text-gray-600">
            Learn about sparkling water from our comprehensive guides.
          </p>
          <Link
            href="/guides"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Read guides
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
} 