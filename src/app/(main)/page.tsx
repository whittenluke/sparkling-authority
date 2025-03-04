'use client'

import Link from 'next/link'
import { TrendingUp, Award, Star, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative w-screen left-[50%] right-[50%] mx-[-50vw]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
        <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover the World of Sparkling Water
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Your trusted guide to exploring, comparing, and enjoying the finest sparkling waters from around the globe.
            </p>
            <div className="mt-10">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search brands, flavors, or types..."
                  className="w-full rounded-full border-0 bg-white px-4 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Popular Categories</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/guides/mineral-water" className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mineral Water</h3>
                  <p className="mt-1 text-sm text-gray-500">Natural springs and mineral content</p>
                </div>
              </div>
            </Link>
            <Link href="/guides/carbonation-levels" className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Carbonation Levels</h3>
                  <p className="mt-1 text-sm text-gray-500">From subtle to extra sparkling</p>
                </div>
              </div>
            </Link>
            <Link href="/guides/flavored" className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flavored Waters</h3>
                  <p className="mt-1 text-sm text-gray-500">Natural and infused varieties</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Latest Reviews</h2>
            <Link href="/reviews" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              View all reviews <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for review cards - will be dynamic */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gray-100" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Brand Name</h3>
                    <div className="mt-1 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                  "A perfectly balanced sparkling water with just the right amount of carbonation..."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl bg-blue-600 shadow-xl">
            <div className="px-8 py-16 sm:px-16 sm:py-24">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="lg:self-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    <span className="block">The Ultimate Guide to</span>
                    <span className="block">Mineral Content</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-blue-100">
                    Learn how mineral content affects taste, health benefits, and overall quality of sparkling water.
                  </p>
                  <Link
                    href="/guides/mineral-content"
                    className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
                  >
                    Read the guide
                    <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                </div>
                <div className="mt-12 lg:mt-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-blue-500">
                    {/* Placeholder for guide image */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 