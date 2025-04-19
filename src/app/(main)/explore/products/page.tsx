'use client'

import { useState } from 'react'
import { ProductList } from './components/ProductList'
import { SearchSection } from './components/SearchSection'

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
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

      <div className="space-y-4">
        {searchQuery && (
          <h2 className="text-lg font-semibold">
            Search Results for &quot;{searchQuery}&quot;
          </h2>
        )}
        <ProductList searchQuery={searchQuery} />
      </div>
    </div>
  )
} 