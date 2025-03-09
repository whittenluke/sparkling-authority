'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

type FlavorProduct = {
  id: string
  name: string
  brand: {
    id: string
    name: string
  }[]
}

export function FlavorsList({ flavors }: { flavors: string[] }) {
  const [expandedFlavor, setExpandedFlavor] = useState<string | null>(null)
  const [products, setProducts] = useState<FlavorProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const toggleFlavor = async (flavor: string) => {
    if (expandedFlavor === flavor) {
      setExpandedFlavor(null)
      setProducts([])
      return
    }

    setExpandedFlavor(flavor)
    setIsLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brands (
          id,
          name
        )
      `)
      .contains('flavor', [flavor])
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } else {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brands
      })))
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {flavors.map((flavor) => (
        <div
          key={flavor}
          className="rounded-xl bg-card shadow-sm ring-1 ring-border overflow-hidden"
        >
          <button
            onClick={() => toggleFlavor(flavor)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent"
          >
            <span className="text-lg font-medium text-foreground">{flavor}</span>
            {expandedFlavor === flavor ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedFlavor === flavor && (
            <div className="px-6 py-4 border-t border-border">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found with this flavor.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/explore/products/${product.id}`}
                      className="block rounded-lg bg-muted p-3 hover:bg-accent transition-colors"
                    >
                      <h3 className="font-medium text-foreground group-hover:text-primary">
                        {product.name}
                      </h3>
                      <span className="ml-2 text-sm text-muted-foreground">by {product.brand[0]?.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 