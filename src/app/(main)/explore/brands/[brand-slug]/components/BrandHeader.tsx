'use client'

import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'

type BrandHeaderProps = {
  brand: {
    id: string
    name: string
    description: string | null
    founded_year: number | null
    country_of_origin: string | null
    brand_logo_light: string | null
    brand_logo_dark: string | null
  }
  productCount: number
}

export function BrandHeader({ brand, productCount }: BrandHeaderProps) {
  const { theme } = useTheme()

  const logoUrl = theme === 'dark' ? brand.brand_logo_dark : brand.brand_logo_light
  const hasLogo = logoUrl !== undefined && logoUrl !== null

  return (
    <div>
      <div className="flex items-start gap-6">
        {/* Brand Logo/Letter */}
        {hasLogo ? (
          <div className="h-28 w-28 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800">
            <Image
              src={logoUrl}
              alt={brand.name}
              width={112}
              height={112}
              className="object-contain w-full h-full"
              sizes="112px"
            />
          </div>
        ) : (
          <div className="h-28 w-28 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center text-foreground text-3xl font-medium border-4 border-white dark:border-gray-800">
            {brand.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{brand.name}</h1>
          {brand.description && (
            <p className="mt-2 text-sm text-muted-foreground">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Brand Quick Stats */}
      <dl className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
          <dt className="text-sm font-medium text-muted-foreground">Founded</dt>
          <dd className="mt-1 text-lg font-medium text-foreground">
            {brand.founded_year || 'Unknown'}
          </dd>
        </div>
        <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
          <dt className="text-sm font-medium text-muted-foreground">Country</dt>
          <dd className="mt-1 text-lg font-medium text-foreground">
            {brand.country_of_origin || 'Unknown'}
          </dd>
        </div>
        <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
          <dt className="text-sm font-medium text-muted-foreground">Products</dt>
          <dd className="mt-1 text-lg font-medium text-foreground">
            {productCount}
          </dd>
        </div>
      </dl>
    </div>
  )
}

