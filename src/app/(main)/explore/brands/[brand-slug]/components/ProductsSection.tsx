'use client'

import { useState } from 'react'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'

type Product = {
  id: string
  name: string
  flavor_tags: string[]
  thumbnail?: string | null
  product_line_id: string
  slug: string
  averageRating?: number
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

export function ProductsSection({ products, productLines }: Props) {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(
    productLines.length > 1 ? null : productLines[0]?.id || null
  )

  const filteredProducts = selectedLineId
    ? products.filter(p => p.product_line_id === selectedLineId)
    : products

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

      {/* Products Grid */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <ProductCard
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
              flavor_tags: product.flavor_tags,
              thumbnail: product.thumbnail,
              averageRating: product.averageRating,
              ratingCount: product.ratingCount
            }}
          />
        ))}
      </div>
    </div>
  )
} 