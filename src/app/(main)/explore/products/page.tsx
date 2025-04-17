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