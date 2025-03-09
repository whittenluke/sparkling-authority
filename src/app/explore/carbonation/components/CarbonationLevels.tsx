'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  carbonation_level: number
  brand: {
    id: string
    name: string
  }
}

type CarbonationLevelsProps = {
  productsByLevel: {
    [key: number]: Product[]
  }
}

const levels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function CarbonationLevels({ productsByLevel }: CarbonationLevelsProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {levels.map((level) => {
        const products = productsByLevel[level] || []
        const hasProducts = products.length > 0

        return (
          <div
            key={level}
            className="rounded-xl bg-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
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
                expandedLevel === level ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )
              )}
            </button>

            {expandedLevel === level && hasProducts && (
              <div className="px-6 py-4 border-t border-border space-y-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/explore/products/${product.id}`}
                    className="block rounded-lg bg-muted p-3 hover:bg-accent transition-colors"
                  >
                    <span className="font-medium text-foreground">{product.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">by {product.brand?.name}</span>
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