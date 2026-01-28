'use client'

import { useState } from 'react'
import { ProductList } from './ProductList'
import { SearchSection } from './SearchSection'
import { ProductCard } from './ProductCard'

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
  averageRating?: number
  ratingCount: number
}

type ProductsContentProps = {
  topRatedProducts: Product[]
}

export function ProductsContent({ topRatedProducts }: ProductsContentProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container py-8 space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Product Directory</h1>
          <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
            Browse our comprehensive collection of sparkling water products.
          </p>
        </div>
        <SearchSection onSearchChange={setSearchQuery} />
      </div>

      {searchQuery && (
        // Show search results when query exists
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Search Results for &quot;{searchQuery}&quot;
          </h2>
          <ProductList searchQuery={searchQuery} />
        </div>
      )}
    </div>
  )
}

