'use client'

import { useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  flavor: string[]
  product_line_id: string
  slug: string
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
  brandSlug: string
}

export function ProductsSection({ products, productLines, brandSlug }: Props) {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(
    productLines[0]?.id || null
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
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/explore/brands/${brandSlug}/products/${product.slug}`}
            className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
          >
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-foreground text-xl font-medium group-hover:bg-muted/80">
              {product.name.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary">
                {product.name}
              </h3>
              {product.flavor && product.flavor.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.flavor.map(flavor => (
                    <span 
                      key={flavor} 
                      className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 