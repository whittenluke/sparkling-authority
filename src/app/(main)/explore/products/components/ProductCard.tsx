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
      className="group block rounded-xl bg-card p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary text-lg">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              by {product.brand.name}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-medium text-foreground">
              {product.averageRating?.toFixed(1) || 'N/A'}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= (product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-transparent text-yellow-400/25'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.ratingCount || 0} rating{(product.ratingCount || 0) !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Flavor Tags */}
        {product.flavor && product.flavor.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.flavor.map((flavor) => (
              <span
                key={flavor}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {flavor}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
} 