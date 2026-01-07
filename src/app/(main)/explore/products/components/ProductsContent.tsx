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
  brand: Brand
  averageRating?: number
  ratingCount?: number
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

      {!searchQuery ? (
        // Show top rated products when no search query
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="font-clash-display text-2xl font-medium text-primary">
            Top Rated Sparkling Waters
          </h2>
          {topRatedProducts.length > 0 ? (
            <div className="space-y-3">
              {topRatedProducts.map((product, index) => (
                <div key={product.id} className="relative">
                  <div className="absolute left-6 top-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-medium z-10">
                    {index + 1}
                  </div>
                  <div className="pl-24">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-plus-jakarta text-lg text-muted-foreground">
                No ratings available yet. Be the first to rate a product!
              </p>
            </div>
          )}
        </div>
      ) : (
        // Show search results when query exists
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Search Results for &quot;{searchQuery}&quot;
          </h2>
          <ProductList searchQuery={searchQuery} />
        </div>
      )}
    </div>
  )
}

