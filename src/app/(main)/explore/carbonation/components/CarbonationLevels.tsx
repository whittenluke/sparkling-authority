'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  carbonation_level: number
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

type CarbonationLevelsProps = {
  productsByLevel: {
    [key: number]: Product[]
  }
}

const levels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function CarbonationLevels({ productsByLevel }: CarbonationLevelsProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())

  return (
    <div className="space-y-4">
      {levels.map((level) => {
        const products = productsByLevel[level] || []
        const hasProducts = products.length > 0

        // Group products by brand
        const brandsWithProducts = products.reduce((acc: { [key: string]: { brand: Product['brand'], products: Product[] } }, product) => {
          if (!acc[product.brand.id]) {
            acc[product.brand.id] = {
              brand: product.brand,
              products: []
            }
          }
          acc[product.brand.id].products.push(product)
          return acc
        }, {})

        return (
          <div
            key={level}
            className="rounded-xl bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedLevels(prev => {
                const newSet = new Set(prev)
                if (newSet.has(level)) {
                  newSet.delete(level)
                } else {
                  newSet.add(level)
                }
                return newSet
              })}
              className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${hasProducts ? 'hover:bg-accent' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!hasProducts}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    background: `hsl(200, ${Math.min(30 + level * 7, 100)}%, ${Math.max(85 - level * 4, 45)}%)`,
                    color: level > 5 ? 'white' : 'inherit'
                  }}
                >
                  {level}
                </div>
                <span className="text-lg font-medium text-foreground">
                  {hasProducts ? `${products.length} Product${products.length === 1 ? '' : 's'}` : 'No Products'}
                </span>
              </div>
              {hasProducts && (
                expandedLevels.has(level) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )
              )}
            </button>

            {expandedLevels.has(level) && hasProducts && (
              <div className="px-6 py-4 border-t border-border space-y-4">
                {Object.values(brandsWithProducts).map(({ brand, products }) => (
                  <div key={brand.id} className="space-y-2">
                    <button
                      onClick={() => setExpandedBrands(prev => {
                        const newSet = new Set(prev)
                        if (newSet.has(brand.id)) {
                          newSet.delete(brand.id)
                        } else {
                          newSet.add(brand.id)
                        }
                        return newSet
                      })}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{brand.name}</span>
                        <Link
                          href={`/explore/brands/${brand.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          View brand
                        </Link>
                      </div>
                      {expandedBrands.has(brand.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {expandedBrands.has(brand.id) && (
                      <div className="pl-4 space-y-2">
                        {products.map((product) => (
                          <Link
                            key={product.id}
                            href={`/explore/brands/${brand.slug}/products/${product.slug}`}
                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 