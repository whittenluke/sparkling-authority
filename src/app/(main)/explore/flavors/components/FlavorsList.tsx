'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'

type FlavorProduct = {
  id: string
  name: string
  slug: string
  flavor_tags: string[]
  thumbnail?: string | null
  brand: {
    id: string
    name: string
    slug: string
  }
  reviews?: { overall_rating: number }[]
  averageRating?: number
  ratingCount: number
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
        flavor_tags,
        thumbnail,
        brand:brand_id (
          id,
          name,
          slug
        ),
        reviews (
          overall_rating
        )
      `)
      .contains('flavor_categories', [category])
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } else {
      const meanRating = 3.5 // Fallback mean rating
      
      setProducts(data.map(p => {
        const ratings = p.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
        const ratingCount = ratings.length
        const averageRating = ratingCount > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratingCount) * 0.7 + meanRating * 0.3
          : undefined
        
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          flavor_tags: p.flavor_tags || [],
          thumbnail: p.thumbnail,
          brand: Array.isArray(p.brand) ? p.brand[0] : p.brand,
          reviews: p.reviews,
          averageRating,
          ratingCount
        }
      }))
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
            flavor_tags,
            thumbnail,
            brand:brand_id (
              id,
              name,
              slug
            ),
            reviews (
              overall_rating
            )
          `)
          .contains('flavor_categories', [initialExpandedCategory])
          .order('name')

        if (error) {
          console.error('Error fetching products:', error)
          setProducts([])
        } else {
          const meanRating = 3.5 // Fallback mean rating
          
          setProducts(data.map(p => {
            const ratings = p.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
            const ratingCount = ratings.length
            const averageRating = ratingCount > 0
              ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratingCount) * 0.7 + meanRating * 0.3
              : undefined
            
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              flavor_tags: p.flavor_tags || [],
              thumbnail: p.thumbnail,
              brand: Array.isArray(p.brand) ? p.brand[0] : p.brand,
              reviews: p.reviews,
              averageRating,
              ratingCount
            }
          }))
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
                <div className="space-y-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        brand: product.brand,
                        flavor_tags: product.flavor_tags,
                        thumbnail: product.thumbnail,
                        averageRating: product.averageRating,
                        ratingCount: product.ratingCount
                      }}
                    />
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