'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type Brand = {
  id: string
  name: string
  description: string | null
  country_of_origin: string | null
  slug: string
}

type RegionalBrandsProps = {
  brandsByCountry: {
    [key: string]: Brand[]
  }
}

export function RegionalBrands({ brandsByCountry }: RegionalBrandsProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  // Sort countries alphabetically, but put "Unknown" at the end
  const countries = Object.keys(brandsByCountry).sort((a, b) => {
    if (a === 'Unknown') return 1
    if (b === 'Unknown') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-4">
      {countries.map((country) => {
        const brands = brandsByCountry[country]

        return (
          <div
            key={country}
            className="rounded-xl bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedCountry(expandedCountry === country ? null : country)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-foreground">
                  {country}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {brands.length} Brand{brands.length === 1 ? '' : 's'}
                  </span>
                </h3>
              </div>
              {expandedCountry === country ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedCountry === country && (
              <div className="px-6 py-4 border-t border-border space-y-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/explore/brands/${brand.slug}`}
                    className="block rounded-lg bg-muted p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <span className="font-medium text-foreground">{brand.name}</span>
                      {brand.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 