'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'

type Product = {
  id: string
  name: string
  carbonation_level: number
  slug: string
  thumbnail?: string | null
  brand: {
    id: string
    name: string
    slug: string
    brand_logo_light?: string | null
    brand_logo_dark?: string | null
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
  const { theme } = useTheme()
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
          {Object.values(brandsWithProducts)
            .sort((a, b) => a.brand.name.localeCompare(b.brand.name))
            .map(({ brand, products }) => (
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
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-accent min-h-[120px]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    {(() => {
                      const logoUrl = theme === 'dark' ? (brand.brand_logo_dark ?? brand.brand_logo_light) : (brand.brand_logo_light ?? brand.brand_logo_dark)
                      if (logoUrl) {
                        return (
                          <Image
                            src={logoUrl}
                            alt=""
                            width={96}
                            height={96}
                            className="h-24 w-24 object-contain"
                          />
                        )
                      }
                      return <span className="text-3xl font-semibold text-muted-foreground">{brand.name.charAt(0)}</span>
                    })()}
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-medium text-foreground">{brand.name}</span>
                    <Link
                      href={`/explore/brands/${brand.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      View brand
                    </Link>
                  </div>
                </div>
                {expandedBrands.has(brand.id) ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {expandedBrands.has(brand.id) && (
                <div className="px-6 py-4 border-t border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <CompactProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          brand: { id: product.brand.id, name: product.brand.name, slug: product.brand.slug },
                          thumbnail: product.thumbnail ?? null,
                          trueAverage: product.trueAverage,
                          ratingCount: product.ratingCount
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 