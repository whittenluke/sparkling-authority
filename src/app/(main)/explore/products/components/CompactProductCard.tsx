'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

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
  thumbnail?: string | null
  trueAverage?: number // True average (for display)
  ratingCount: number
}

interface CompactProductCardProps {
  product: Product
}

export function CompactProductCard({ product }: CompactProductCardProps) {
  return (
    <Link
      href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
      className="group block rounded-lg bg-card p-3 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
    >
      {/* Product Image */}
      <div className="aspect-square w-full rounded-md overflow-hidden mb-2 bg-muted flex items-center justify-center">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            width={200}
            height={200}
            className="object-cover h-full w-full group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-foreground text-2xl font-medium">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Brand Name */}
        <p className="text-xs text-muted-foreground truncate">
          {product.brand.name}
        </p>

        {/* Product Name */}
        <h3 className="font-medium text-sm text-foreground group-hover:text-primary line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 pt-1">
          {typeof product.trueAverage === 'number' ? (
            <>
              <span className="text-xs font-medium text-foreground">
                {product.trueAverage.toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {getStarFillPercentages(product.trueAverage).map((percentage, index) => (
                  <PartialStar
                    key={index}
                    fillPercentage={percentage}
                    size={12}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.ratingCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No ratings</span>
          )}
        </div>
      </div>
    </Link>
  )
}
