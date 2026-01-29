'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'
import { FlavorIcon } from '@/components/home/FlavorIcon'
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

// Available icon categories
const ICON_CATEGORIES = ['berry', 'citrus', 'cream', 'floral', 'melon', 'soda', 'tropical', 'unflavored']

// Helper to check if category has a custom icon
function hasCustomIcon(category: string): boolean {
  return ICON_CATEGORIES.includes(category.toLowerCase())
}

type FlavorsListProps = {
  categories: string[]
  initialExpandedCategory?: string
  initialSelectedTag?: string
}

export function FlavorsList({ categories, initialExpandedCategory, initialSelectedTag }: FlavorsListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialExpandedCategory || null)
  const [selectedTag, setSelectedTag] = useState<string | null>(initialSelectedTag || null)
  const [flavorTags, setFlavorTags] = useState<FlavorTag[]>([])
  const [allProducts, setAllProducts] = useState<FlavorProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const supabase = createClientComponentClient()
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})


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
      }

      loadInitialCategory()
    }
  }, [initialExpandedCategory, initialSelectedTag, supabase])

  // Auto-select the initial tag after category data is loaded
  useEffect(() => {
    if (initialSelectedTag && expandedCategory === initialExpandedCategory && flavorTags.length > 0) {
      // Check if the initial tag exists in the loaded flavor tags
      const tagExists = flavorTags.some(flavorTag => flavorTag.tag === initialSelectedTag)
      if (tagExists && selectedTag !== initialSelectedTag) {
        setSelectedTag(initialSelectedTag)
      }
    }
  }, [initialSelectedTag, initialExpandedCategory, expandedCategory, flavorTags, selectedTag])

  // Fetch product count for a category
  const fetchCategoryCount = async (category: string) => {
    // Skip if already fetched
    if (categoryCounts[category] !== undefined) {
      return
    }

    const categoryTags = categoryTagMap[category as keyof typeof categoryTagMap] || []
    if (categoryTags.length === 0) {
      setCategoryCounts(prev => ({ ...prev, [category]: 0 }))
      return
    }

    try {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .overlaps('flavor_tags', categoryTags)

      setCategoryCounts(prev => ({ ...prev, [category]: count || 0 }))
    } catch (error) {
      console.error(`Error fetching count for category ${category}:`, error)
      setCategoryCounts(prev => ({ ...prev, [category]: 0 }))
    }
  }

  // Fetch counts for all categories on mount
  useEffect(() => {
    categories.forEach(category => {
      fetchCategoryCount(category)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  // Filter products based on selected tag
  const filteredProducts = selectedTag
    ? allProducts.filter(product => product.flavor_tags.includes(selectedTag))
    : allProducts

  // Helper to get product count for a category
  const getProductCount = (category: string) => {
    // If category is expanded and we have products loaded, use that count (more accurate)
    if (expandedCategory === category && allProducts.length > 0) {
      return allProducts.length
    }
    // Otherwise use the stored count
    return categoryCounts[category] || 0
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const productCount = getProductCount(category)
        const categoryName = formatCategoryName(category)
        const categorySlug = category.toLowerCase()
        const isExpanded = expandedCategory === category

        return (
          <div
            key={category}
            ref={(el) => {
              categoryRefs.current[category] = el
            }}
            className="rounded-2xl bg-card shadow-sm ring-1 ring-border overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {hasCustomIcon(categorySlug) ? (
                  <FlavorIcon category={categorySlug} size={40} />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold flex-shrink-0">
                    {categoryName.charAt(0)}
                  </div>
                )}
                <span className="text-lg font-bold text-foreground">{categoryName}</span>
              </div>
              <div className="flex items-center gap-3">
                {productCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({productCount} {productCount === 1 ? 'product' : 'products'})
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 border-t border-border">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading products...</p>
                ) : allProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products found in this category.</p>
                ) : (
                  <div className="space-y-6">
                    {/* Flavor Tags */}
                    <div className="flex flex-wrap gap-3">
                      {flavorTags.map((flavorTag) => (
                        <button
                          key={flavorTag.tag}
                          onClick={() => selectTag(flavorTag.tag)}
                          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            selectedTag === flavorTag.tag
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-accent-foreground hover:bg-accent/80'
                          }`}
                        >
                          {flavorTag.tag}
                          <span className="ml-2 text-xs opacity-75">
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
                            No products found with tag &quot;{selectedTag}&quot;.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => (
                              <CompactProductCard
                                key={product.id}
                                product={{
                                  id: product.id,
                                  name: product.name,
                                  slug: product.slug,
                                  brand: product.brand,
                                  thumbnail: product.thumbnail,
                                  trueAverage: product.trueAverage,
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
        )
      })}
    </div>
  )
}
