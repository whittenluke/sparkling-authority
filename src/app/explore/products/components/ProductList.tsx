'use client'

import Link from 'next/link'

type Product = {
  id: string
  name: string
  brand: {
    id: string
    name: string
  }
}

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/explore/products/${product.id}`}
          className="group block rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-primary"
        >
          <div className="flex items-start gap-5">
            {/* Product Image Placeholder */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted group-hover:bg-accent">
              <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground">
                {product.name.charAt(0)}
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="font-medium text-foreground group-hover:text-primary">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                by {product.brand?.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 