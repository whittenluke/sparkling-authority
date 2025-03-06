'use client'

import Link from 'next/link'
import { TrendingUp, Award, Star, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplified */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Your Guide to Sparkling Water
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Expert reviews and insights for finding your perfect beverage.
          </p>
        </div>
      </section>

      {/* Search Section - More Prominent */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-6 w-6 text-[#0EA5E9]" />
          </div>
          <input
            type="text"
            placeholder="Try 'mineral water with high carbonation' or 'citrus flavored'"
            className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-lg text-gray-900 shadow-lg ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0EA5E9] transition-shadow hover:shadow-xl"
          />
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-600">
          <span>Popular:</span>
          <button className="rounded-full bg-[#7DD3FC]/10 px-3 py-1 hover:bg-[#7DD3FC]/20">Mineral</button>
          <button className="rounded-full bg-[#7DD3FC]/10 px-3 py-1 hover:bg-[#7DD3FC]/20">High Carbonation</button>
          <button className="rounded-full bg-[#7DD3FC]/10 px-3 py-1 hover:bg-[#7DD3FC]/20">Citrus</button>
        </div>
      </section>

      {/* Categories - Simplified */}
      <section className="mt-16 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/guides/mineral-water" 
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7DD3FC]/10 group-hover:bg-[#7DD3FC]/20">
                  <Award className="h-7 w-7 text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mineral Water</h3>
                  <p className="mt-1 text-sm text-gray-600">Natural springs and mineral content</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/guides/carbonation-levels" 
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7DD3FC]/10 group-hover:bg-[#7DD3FC]/20">
                  <TrendingUp className="h-7 w-7 text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Carbonation Levels</h3>
                  <p className="mt-1 text-sm text-gray-600">From subtle to extra sparkling</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/guides/flavored" 
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7DD3FC]/10 group-hover:bg-[#7DD3FC]/20">
                  <Star className="h-7 w-7 text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flavored Waters</h3>
                  <p className="mt-1 text-sm text-gray-600">Natural and infused varieties</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Latest Reviews */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Latest Reviews</h2>
              <Link 
                href="/reviews" 
                className="text-sm font-medium text-[#0EA5E9] hover:text-[#0369A1]"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Link
                  key={i}
                  href="/reviews/1"
                  className="group block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-[#7DD3FC]/10" />
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#0EA5E9]">Brand Name</h3>
                      <div className="mt-1 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-[#0EA5E9]" fill="currentColor" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">5.0</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Guide */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] p-8 text-white">
            <h2 className="text-2xl font-bold">The Ultimate Guide to Mineral Content</h2>
            <p className="mt-4 text-[#7DD3FC]">
              Learn how mineral content affects taste, health benefits, and overall quality of sparkling water.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/guides/mineral-content"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0EA5E9] hover:bg-gray-50"
              >
                Read the guide
              </Link>
              <span className="text-sm text-[#7DD3FC]">10 min read</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 