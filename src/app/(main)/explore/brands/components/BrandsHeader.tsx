'use client'

import { BrandSearch } from './BrandSearch'

type BrandsHeaderProps = {
  onSearchChange: (query: string) => void
}

export function BrandsHeader({ onSearchChange }: BrandsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title and Description */}
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Brands</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          Discover and explore the world&apos;s finest sparkling water brands.
        </p>
      </div>

      {/* Search */}
      <div>
        <BrandSearch onSearchChange={onSearchChange} />
      </div>
    </div>
  )
} 