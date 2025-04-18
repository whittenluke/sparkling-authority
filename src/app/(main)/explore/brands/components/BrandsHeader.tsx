'use client'

import { Search } from 'lucide-react'

export function BrandsHeader() {
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
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="search"
            placeholder="Search brands..."
            className="font-plus-jakarta block w-full rounded-lg border border-input py-3 pl-10 pr-4 text-foreground bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
} 