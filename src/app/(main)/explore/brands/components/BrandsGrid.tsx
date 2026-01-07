'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'

type BrandEntry = {
  id: string
  name: string
  description?: string
  brand_logo_light?: string
  brand_logo_dark?: string
  productCount: number
  isProductLine: boolean
  productLineId?: string
  slug: string
}

export function BrandsGrid({ brands }: { brands: BrandEntry[] }) {
  const { theme } = useTheme()
  
  return (
    <div className="space-y-3">
      {brands.map((brand) => {
        const logoUrl = theme === 'dark' ? brand.brand_logo_dark : brand.brand_logo_light
        const hasLogo = logoUrl !== undefined && logoUrl !== null
        
        return (
          <Link
            key={brand.isProductLine ? `${brand.id}-${brand.productLineId}` : brand.id}
            href={brand.isProductLine 
              ? `/explore/brands/${brand.slug}/line/${brand.productLineId}`
              : `/explore/brands/${brand.slug}`
            }
            className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
          >
            {hasLogo ? (
              <div className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
                <Image
                  src={logoUrl}
                  alt={brand.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
                {brand.name.charAt(0)}
              </div>
            )}
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
        )
      })}
    </div>
  )
} 