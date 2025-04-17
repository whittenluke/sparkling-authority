'use client'

import Link from 'next/link'

type Product = {
  id: string
  name: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
      className="group flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
    >
      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-foreground text-2xl font-medium group-hover:bg-muted/80">
        {product.name.charAt(0)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground group-hover:text-primary text-lg">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          by {product.brand?.name}
        </p>
      </div>
    </Link>
  )
} 