'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  brand: Brand
  flavor: string[]
  averageRating: number
  ratingCount: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
      className="group block rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
    >
      <div className="flex flex-col gap-2">
        {/* Top: Title and Rating */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground group-hover:text-primary text-base truncate pr-4">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-medium text-foreground">
              {product.averageRating?.toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-transparent text-yellow-400/25'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.ratingCount})
            </span>
          </div>
        </div>

        {/* Bottom: Brand and Tags */}
        <div>
          <p className="text-sm text-muted-foreground">
            by {product.brand.name}
          </p>
          {product.flavor && product.flavor.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.flavor.map((flavor) => (
                <span
                  key={flavor}
                  className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                >
                  {flavor}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
} 