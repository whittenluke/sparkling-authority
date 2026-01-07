'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

type FlavorProduct = {
  id: string
  name: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

// Helper function to format category name for display
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function FlavorsList({ categories }: { categories: string[] }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<FlavorProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const toggleCategory = async (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null)
      setProducts([])
      return
    }

    setExpandedCategory(category)
    setIsLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        brand:brand_id (
          id,
          name,
          slug
        )
      `)
      .contains('flavor_categories', [category])
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } else {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: Array.isArray(p.brand) ? p.brand[0] : p.brand
      })))
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category}
          className="rounded-xl bg-card shadow-sm ring-1 ring-border overflow-hidden"
        >
          <button
            onClick={() => toggleCategory(category)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent sm:px-6 sm:py-4"
          >
            <span className="text-base font-medium text-foreground sm:text-lg">{formatCategoryName(category)}</span>
            {expandedCategory === category ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            )}
          </button>

          {expandedCategory === category && (
            <div className="px-4 py-3 border-t border-border sm:px-6 sm:py-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found in this category.</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
                      className="block rounded-lg bg-muted p-2 hover:bg-accent transition-colors sm:p-3"
                    >
                      <h3 className="font-medium text-foreground group-hover:text-primary">
                        {product.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">by {product.brand.name}</span>
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