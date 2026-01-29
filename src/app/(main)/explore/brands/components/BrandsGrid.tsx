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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
            className="group relative flex flex-col items-center justify-center rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary transition-all text-center"
          >
            <div className="flex h-32 w-32 items-center justify-center mb-3 overflow-hidden">
              {hasLogo ? (
                <div className="h-full w-full bg-white rounded-xl flex items-center justify-center">
                  <Image
                    src={logoUrl}
                    alt={brand.name}
                    width={128}
                    height={128}
                    className="object-contain w-full h-full p-2"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-primary/10 rounded-xl flex items-center justify-center text-primary text-3xl font-medium">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-base font-clash-display font-medium text-primary">
              {brand.name}
            </h3>
          </Link>
        )
      })}
    </div>
  )
} 