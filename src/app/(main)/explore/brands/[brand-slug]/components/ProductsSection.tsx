'use client'

import { useState, useMemo } from 'react'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'
import { ChevronDown } from 'lucide-react'

type Product = {
  id: string
  name: string
  thumbnail?: string | null
  product_line_id: string
  slug: string
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
  brand: {
    id: string
    name: string
    slug: string
  }
}

type ProductLine = {
  id: string
  name: string
  description: string | null
  is_default: boolean
}

type Props = {
  products: Product[]
  productLines: ProductLine[]
}

type SortOption = 'rating' | 'name'

export function ProductsSection({ products, productLines }: Props) {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(
    productLines.length > 1 ? null : productLines[0]?.id || null
  )
  const [sortBy, setSortBy] = useState<SortOption>('rating')

  // Filter products by selected line
  const filteredProducts = useMemo(() => {
    return selectedLineId
      ? products.filter(p => p.product_line_id === selectedLineId)
      : products
  }, [products, selectedLineId])

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'rating') {
        // Sort by Bayesian average (descending)
        if (b.averageRating !== a.averageRating) {
          return (b.averageRating || 0) - (a.averageRating || 0)
        }
        // Tie-breaker: rating count
        return b.ratingCount - a.ratingCount
      } else {
        // Sort by name (ascending)
        return a.name.localeCompare(b.name)
      }
    })
  }, [filteredProducts, sortBy])

  return (
    <div>
      {/* Product Line Filter */}
      {productLines.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-3">Product Lines</h2>
          <div className="flex flex-wrap gap-2">
            {productLines.length > 1 && (
              <button
                onClick={() => setSelectedLineId(null)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${selectedLineId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }
                `}
              >
                All Products
              </button>
            )}
            {productLines.map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLineId(line.id)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${selectedLineId === line.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }
                `}
              >
                {line.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Header with Sort */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Products ({sortedProducts.length})
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-muted-foreground">
            Sort:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-background border border-input rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="rating">Rating</option>
              <option value="name">Name A-Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sortedProducts.map((product) => (
          <CompactProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              brand: {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug
              },
              thumbnail: product.thumbnail,
              trueAverage: product.trueAverage,
              ratingCount: product.ratingCount
            }}
          />
        ))}
      </div>
    </div>
  )
} 