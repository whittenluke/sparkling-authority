'use client'

import { useState, useEffect, useRef } from 'react'
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

type FlavorsListProps = {
  categories: string[]
  initialExpandedCategory?: string
}

export function FlavorsList({ categories, initialExpandedCategory }: FlavorsListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialExpandedCategory || null)
  const [products, setProducts] = useState<FlavorProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category]
    if (element) {
      // Scroll with a small offset from the top for better UX
      const yOffset = -20
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

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
    
    // Scroll to the category after a brief delay to ensure content is rendered
    setTimeout(() => scrollToCategory(category), 100)
  }

  // Auto-load products for initial category on mount
  useEffect(() => {
    if (initialExpandedCategory) {
      const loadInitialCategory = async () => {
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
          .contains('flavor_categories', [initialExpandedCategory])
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
        
        // Scroll to the initial category after content is loaded
        setTimeout(() => scrollToCategory(initialExpandedCategory), 300)
      }

      loadInitialCategory()
    }
  }, [initialExpandedCategory, supabase])

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category}
          ref={(el) => {
            categoryRefs.current[category] = el
          }}
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