'use client'

import Link from 'next/link'

type BrandEntry = {
  id: string
  name: string
  description?: string
  productCount: number
  isProductLine: boolean
  productLineId?: string
}

export function BrandsGrid({ brands }: { brands: BrandEntry[] }) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {brands.map((brand) => (
        <Link
          key={brand.isProductLine ? `${brand.id}-${brand.productLineId}` : brand.id}
          href={brand.isProductLine 
            ? `/explore/brands/${brand.id}/line/${brand.productLineId}`
            : `/explore/brands/${brand.id}`
          }
          className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
        >
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-foreground text-xl font-medium">
            {brand.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground group-hover:text-primary">
              {brand.name}
            </h3>
            {brand.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{brand.description}</p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
          </div>
        </Link>
      ))}
    </div>
  )
} 