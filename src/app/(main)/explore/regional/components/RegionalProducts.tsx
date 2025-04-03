'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  brands: {
    id: string
    name: string
    country_of_origin: string | null
  }
}

type RegionalProductsProps = {
  productsByCountry: {
    [key: string]: Product[]
  }
}

export function RegionalProducts({ productsByCountry }: RegionalProductsProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  // Sort countries alphabetically, but put "Unknown" at the end
  const countries = Object.keys(productsByCountry).sort((a, b) => {
    if (a === 'Unknown') return 1
    if (b === 'Unknown') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-4">
      {countries.map((country) => {
        const products = productsByCountry[country]

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
                    {products.length} Product{products.length === 1 ? '' : 's'}
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
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/explore/products/${product.id}`}
                    className="block rounded-lg bg-muted p-3 hover:bg-accent transition-colors"
                  >
                    <span className="font-medium text-foreground">{product.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">by {product.brands.name}</span>
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