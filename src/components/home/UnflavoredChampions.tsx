'use client'

import Link from 'next/link'
import { ProductCardHorizontal } from '@/app/(main)/explore/products/components/ProductCardHorizontal'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  flavor_tags: string[]
  thumbnail?: string | null
  brand: Brand
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
}

interface UnflavoredChampionsProps {
  products: Product[]
  totalCount?: number
}

export function UnflavoredChampions({ products, totalCount }: UnflavoredChampionsProps) {
  if (products.length === 0) {
    return null
  }

  const displayCount = totalCount || products.length

  return (
    <div className="mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-clash-display text-2xl font-medium text-primary">
          Unflavored Champions
        </h2>
        <Link
          href="/explore/flavors?category=unflavored&tag=unflavored"
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          View All {displayCount}
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
        <div className="flex gap-3 sm:gap-4 w-max px-1">
          {products.map((product) => (
            <ProductCardHorizontal
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>

      {/* Scroll Hint for Mobile */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm text-muted-foreground">
          Swipe to see more →
        </p>
      </div>
    </div>
  )
}
