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

type CarbonationSpectrumProps = {
  productsByLevel: {
    [key: number]: Product[]
  }
}

const carbonationLevels = [
  { level: 1, description: 'Very Light - Barely noticeable bubbles, extremely subtle' },
  { level: 2, description: 'Light - Gentle effervescence, soft texture' },
  { level: 3, description: 'Light-Medium - Noticeable but delicate carbonation' },
  { level: 4, description: 'Medium-Light - Balanced bubbles, refreshing' },
  { level: 5, description: 'Medium - Classic sparkling water feel' },
  { level: 6, description: 'Medium-Strong - Pronounced fizz, energetic' },
  { level: 7, description: 'Strong - Vigorous bubbles, bold sensation' },
  { level: 8, description: 'Very Strong - Intense carbonation, sharp' },
  { level: 9, description: 'Extra Strong - Powerful fizz, aggressive bubbles' },
  { level: 10, description: 'Maximum - Extreme carbonation, intense experience' },
].sort((a, b) => a.level - b.level)

export function CarbonationSpectrum({ productsByLevel }: CarbonationSpectrumProps) {
  const [activeLevel, setActiveLevel] = useState<number | null>(null)
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())

  const handleLevelClick = (level: number) => {
    setActiveLevel(activeLevel === level ? null : level)
  }

  const products = activeLevel ? productsByLevel[activeLevel] || [] : []
  
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
    <div className="space-y-6">
      {/* Visual Spectrum */}
      <div className="relative">
        <div className="h-12 rounded-lg overflow-hidden flex">
          {carbonationLevels.map(({ level }) => (
            <button
              key={level}
              className={`flex-1 transition-colors hover:brightness-110 ${activeLevel === level ? 'ring-2 ring-primary ring-inset' : ''}`}
              style={{
                background: `hsl(200, ${Math.min(30 + level * 7, 100)}%, ${Math.max(85 - level * 4, 45)}%)`
              }}
              onClick={() => handleLevelClick(level)}
            >
              <span className="sr-only">Level {level}</span>
            </button>
          ))}
        </div>

        {/* Level Numbers */}
        <div className="flex justify-between mt-2 px-[2%]">
          {carbonationLevels.map(({ level }) => (
            <div
              key={level}
              className={`text-sm font-medium transition-colors ${activeLevel === level ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {level}
            </div>
          ))}
        </div>
      </div>

      {/* Brands List */}
      {activeLevel && (
        <div className="space-y-4">
          {Object.values(brandsWithProducts).map(({ brand, products }) => (
            <div
              key={brand.id}
              className="rounded-xl bg-card overflow-hidden"
            >
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
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-accent"
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
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {expandedBrands.has(brand.id) && (
                <div className="px-6 py-4 border-t border-border space-y-2">
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
} 