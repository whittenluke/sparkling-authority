'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
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

interface StrongestCarbonationProps {
  products: Product[]
}

export function StrongestCarbonation({ products }: StrongestCarbonationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) {
    return null
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' })
    }
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-clash-display text-xl font-medium text-primary">
          Strongest Carbonation
        </h2>
        <div className="flex items-center gap-2">
          {/* Carousel Navigation */}
          <button
            onClick={scrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <Link
            href="/ratings/strongest-carbonation"
            className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
      >
        <div className="flex gap-3 sm:gap-4 w-max px-1 pt-1">
          {products.map((product) => (
            <ProductCardHorizontal
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
