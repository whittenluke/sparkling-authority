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
        <SearchSection onSearchChange={setSearchQuery} />
      </div>

      {searchQuery && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h2>
          <ProductList searchQuery={searchQuery} />
        </div>
      )}

      {!searchQuery && (
        <div className="text-center text-muted-foreground mt-12">
          <p>Enter a search term to discover products</p>
        </div>
      )}
    </div>
  )
} 