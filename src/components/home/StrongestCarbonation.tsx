'use client'

import Link from 'next/link'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  thumbnail?: string | null
  brand: Brand
  trueAverage?: number // True average (for display)
  ratingCount: number
}

interface StrongestCarbonationProps {
  products: Product[]
}

export function StrongestCarbonation({ products }: StrongestCarbonationProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-clash-display text-2xl font-medium text-primary sm:text-3xl">
          Strongest Carbonation
        </h2>
        <Link
          href="/ratings/strongest-carbonation"
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Responsive Grid/Scroll Container */}
      <div className="relative">
        {/* Desktop/Tablet: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <CompactProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* Mobile: Horizontal Scroll with Fade Edge */}
        <div className="md:hidden relative">
          <div className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth -mx-4 px-4">
            <div className="flex gap-3 w-max">
              {products.map((product) => (
                <div key={product.id} className="w-[160px] flex-shrink-0">
                  <CompactProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          {/* Fade edge effect on right */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
