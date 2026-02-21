'use client'

import { useState } from 'react'
import { SearchSection } from './SearchSection'
import { SearchResults } from './SearchResults'

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
  initialSearchQuery?: string
}

export function ProductsContent({ topRatedProducts, initialSearchQuery = '' }: ProductsContentProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)

  return (
    <div className="w-full py-8 space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Product Directory</h1>
          <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
            Browse our comprehensive collection of sparkling water products.
          </p>
        </div>
        <SearchSection
          onSearchChangeAction={setSearchQuery}
          initialSearchValue={initialSearchQuery}
        />
      </div>

      {searchQuery && searchQuery.length >= 2 && (
        <SearchResults searchQuery={searchQuery} scope="products" />
      )}
    </div>
  )
}

