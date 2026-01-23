'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'
import categoryTagMap from '@/categoryTagMap.json'

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
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
}

type FlavorTag = {
  tag: string
  count: number
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [flavorTags, setFlavorTags] = useState<FlavorTag[]>([])
  const [allProducts, setAllProducts] = useState<FlavorProduct[]>([])
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
      setSelectedTag(null)
      setFlavorTags([])
      setAllProducts([])
      return
    }

    setExpandedCategory(category)
    setSelectedTag(null) // Reset tag selection when changing categories
    setIsLoading(true)

    // Get the tags that belong to this category from the mapping
    const categoryTags = categoryTagMap[category as keyof typeof categoryTagMap] || []

    // Get mean rating across ALL products for Bayesian average
    const { data: allProductsData } = await supabase
      .from('products')
      .select(`
        reviews (
          overall_rating
        )
      `)

    const allRatings = allProductsData?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
    const meanRating = allRatings.length > 0
      ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
      : 3.5 // Fallback to 3.5 if no ratings exist

    // Query products that have any of the category's tags
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
      .overlaps('flavor_tags', categoryTags)
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      setAllProducts([])
      setFlavorTags([])
    } else {
      const processedProducts = data.map(p => {
        const ratings = p.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
        const ratingCount = ratings.length

        // Calculate Bayesian average (for sorting) - consistent with other pages
        const C = 10 // confidence factor
        const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
        const bayesianAverage = ratingCount > 0
          ? (C * meanRating + sumOfRatings) / (C + ratingCount)
          : undefined

        // Calculate true average (for display)
        const trueAverage = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          flavor_tags: p.flavor_tags || [],
          thumbnail: p.thumbnail,
          brand: Array.isArray(p.brand) ? p.brand[0] : p.brand,
          reviews: p.reviews,
          averageRating: bayesianAverage,
          trueAverage,
          ratingCount
        }
      })

      setAllProducts(processedProducts)

      // Extract and count flavor tags, but only include tags that belong to this category
      const tagCounts: { [key: string]: number } = {}
      processedProducts.forEach(product => {
        product.flavor_tags.forEach((tag: string) => {
          // Only count tags that belong to this category
          if (categoryTags.includes(tag)) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      })

      const sortedTags: FlavorTag[] = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count // Most products first
          }
          return a.tag.localeCompare(b.tag) // Alphabetical for ties
        })

      setFlavorTags(sortedTags)
    }

    setIsLoading(false)

    // Scroll to the category after a brief delay to ensure content is rendered
    setTimeout(() => scrollToCategory(category), 100)
  }

  const selectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null) // Deselect if clicking the same tag
    } else {
      setSelectedTag(tag)
    }
  }

  // Auto-load products for initial category on mount
  useEffect(() => {
    if (initialExpandedCategory) {
      const loadInitialCategory = async () => {
        setIsLoading(true)

        // Get the tags that belong to this category from the mapping
        const categoryTags = categoryTagMap[initialExpandedCategory as keyof typeof categoryTagMap] || []

        // Get mean rating across ALL products for Bayesian average
        const { data: allProductsData } = await supabase
          .from('products')
          .select(`
            reviews (
              overall_rating
            )
          `)

        const allRatings = allProductsData?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
        const meanRating = allRatings.length > 0
          ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
          : 3.5 // Fallback to 3.5 if no ratings exist

        // Query products that have any of the category's tags
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
          .overlaps('flavor_tags', categoryTags)
          .order('name')

        if (error) {
          console.error('Error fetching products:', error)
          setAllProducts([])
          setFlavorTags([])
        } else {
          const processedProducts = data.map(p => {
            const ratings = p.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
            const ratingCount = ratings.length

            // Calculate Bayesian average (for sorting) - consistent with other pages
            const C = 10 // confidence factor
            const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
            const bayesianAverage = ratingCount > 0
              ? (C * meanRating + sumOfRatings) / (C + ratingCount)
              : undefined

            // Calculate true average (for display)
            const trueAverage = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              flavor_tags: p.flavor_tags || [],
              thumbnail: p.thumbnail,
              brand: Array.isArray(p.brand) ? p.brand[0] : p.brand,
              reviews: p.reviews,
              averageRating: bayesianAverage,
              trueAverage,
              ratingCount
            }
          })

          setAllProducts(processedProducts)

          // Extract and count flavor tags, but only include tags that belong to this category
          const tagCounts: { [key: string]: number } = {}
          processedProducts.forEach(product => {
            product.flavor_tags.forEach((tag: string) => {
              // Only count tags that belong to this category
              if (categoryTags.includes(tag)) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1
              }
            })
          })

          const sortedTags: FlavorTag[] = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => {
              if (b.count !== a.count) {
                return b.count - a.count // Most products first
              }
              return a.tag.localeCompare(b.tag) // Alphabetical for ties
            })

          setFlavorTags(sortedTags)
        }

        setIsLoading(false)

        // Scroll to the initial category after content is loaded
        setTimeout(() => scrollToCategory(initialExpandedCategory), 300)
      }

      loadInitialCategory()
    }
  }, [initialExpandedCategory, supabase])

  // Filter products based on selected tag
  const filteredProducts = selectedTag
    ? allProducts.filter(product => product.flavor_tags.includes(selectedTag))
    : allProducts

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
              ) : allProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found in this category.</p>
              ) : (
                <div className="space-y-4">
                  {/* Flavor Tags */}
                  <div className="flex flex-wrap gap-2">
                    {flavorTags.map((flavorTag) => (
                      <button
                        key={flavorTag.tag}
                        onClick={() => selectTag(flavorTag.tag)}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                          selectedTag === flavorTag.tag
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground hover:bg-accent/80'
                        }`}
                      >
                        {flavorTag.tag}
                        <span className="ml-1.5 text-xs opacity-75">
                          ({flavorTag.count})
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Filtered Products - Only show when a tag is selected */}
                  {selectedTag && (
                    <>
                      {filteredProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No products found with tag "{selectedTag}".
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {filteredProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                brand: product.brand,
                                flavor_tags: product.flavor_tags,
                                thumbnail: product.thumbnail,
                                averageRating: product.averageRating, // Bayesian for sorting
                                trueAverage: product.trueAverage, // True average for display
                                ratingCount: product.ratingCount
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
