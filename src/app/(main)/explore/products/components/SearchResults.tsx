'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ProductCard } from './ProductCard'
import { BrandsGrid } from '@/app/(main)/explore/brands/components/BrandsGrid'
import { useDebounce } from '@/hooks/useDebounce'
import categoryTagMap from '@/categoryTagMap.json'

interface SearchResultsProps {
  searchQuery: string
}

type Brand = {
  id: string
  name: string
  slug: string
  description?: string
  brand_logo_light?: string
  brand_logo_dark?: string
  productCount: number
  isProductLine: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  brand: Brand
  flavor_tags: string[]
  thumbnail?: string | null
  averageRating?: number
  ratingCount: number
}

type FlavorCategory = {
  category: string
  categoryDisplayName: string
  matchingTags: string[]
  products: Product[]
}

const PRODUCTS_PER_PAGE = 12
const INITIAL_PRODUCTS_COUNT = 7

export function SearchResults({ searchQuery }: SearchResultsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [flavorCategories, setFlavorCategories] = useState<FlavorCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productPage, setProductPage] = useState(1)
  const [hasMoreProducts, setHasMoreProducts] = useState(true)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const loadingRef = useRef(false)
  const supabase = createClientComponentClient()
  
  // Get mean rating for Bayesian average calculation
  const getMeanRating = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        reviews (
          overall_rating
        )
      `)

    const allRatings = data?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
    return allRatings.length > 0
      ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
      : 3.5
  }, [supabase])

  // Fetch products with enhanced search
  const fetchProducts = useCallback(async (pageNum: number) => {
    if (loadingRef.current || !searchQuery) return []
    
    try {
      loadingRef.current = true
      
      const start = (pageNum - 1) * PRODUCTS_PER_PAGE
      const end = start + PRODUCTS_PER_PAGE - 1
      
      let query = supabase
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
        .range(start, end)
        .order('name', { ascending: true })
        
      // Enhanced search: search in product name, brand name, and flavor tags
      if (searchQuery) {
        // First, get brand IDs that match the search query
        const { data: matchingBrands } = await supabase
          .from('brands')
          .select('id')
          .ilike('name', `%${searchQuery}%`)
        
        const brandIds = matchingBrands?.map(b => b.id) || []
        
        // Build the OR condition properly
        let orConditions = [`name.ilike.%${searchQuery}%`]
        
        // Add brand ID conditions
        if (brandIds.length > 0) {
          orConditions.push(`brand_id.in.(${brandIds.join(',')})`)
        }
        
        // Add flavor tag conditions
        orConditions.push(`flavor_tags.cs.{${searchQuery}}`)
        
        query = query.or(orConditions.join(','))
      }
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      const meanRating = await getMeanRating()
      const transformedProducts = data.map(product => {
        const ratings = product.reviews?.map(r => r.overall_rating) || []
        const ratingCount = ratings.length

        // Calculate Bayesian average (for sorting)
        const C = 10 // confidence factor
        const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
        const bayesianAverage = ratingCount > 0
          ? (C * meanRating + sumOfRatings) / (C + ratingCount)
          : undefined

        // Calculate true average (for display)
        const trueAverage = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

        const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            description: undefined,
            brand_logo_light: undefined,
            brand_logo_dark: undefined,
            productCount: 0,
            isProductLine: false
          },
          flavor_tags: product.flavor_tags || [],
          thumbnail: product.thumbnail,
          averageRating: bayesianAverage,
          trueAverage,
          ratingCount
        }
      })
      
      setHasMoreProducts(transformedProducts.length === PRODUCTS_PER_PAGE)
      return transformedProducts
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error fetching products: ' + (err instanceof Error ? err.message : String(err)))
      return []
    } finally {
      loadingRef.current = false
    }
  }, [searchQuery, supabase, getMeanRating])

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    if (!searchQuery) {
      setBrands([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          brand_logo_light,
          brand_logo_dark,
          products (
            id
          )
        `)
        .ilike('name', `%${searchQuery}%`)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      const brandEntries = data.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        brand_logo_light: brand.brand_logo_light,
        brand_logo_dark: brand.brand_logo_dark,
        productCount: brand.products?.length || 0,
        isProductLine: false
      }))

      setBrands(brandEntries)
    } catch (err) {
      console.error('Error fetching brands:', err)
      setError('Error fetching brands: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [searchQuery, supabase])

  // Fetch flavor categories and products
  const fetchFlavors = useCallback(async () => {
    if (!searchQuery) {
      setFlavorCategories([])
      return
    }

    try {
      // Find matching flavor tags
      const matchingTags: string[] = []
      const categoriesWithMatches: string[] = []

      Object.entries(categoryTagMap).forEach(([category, tags]) => {
        const matchingCategoryTags = tags.filter((tag: string) => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (matchingCategoryTags.length > 0) {
          matchingTags.push(...matchingCategoryTags)
          categoriesWithMatches.push(category)
        }
      })

      if (matchingTags.length === 0) {
        setFlavorCategories([])
        return
      }

      // Fetch products that have these flavor tags
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
        .overlaps('flavor_tags', matchingTags)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      const meanRating = await getMeanRating()
      const transformedProducts = data.map(product => {
        const ratings = product.reviews?.map(r => r.overall_rating) || []
        const ratingCount = ratings.length

        // Calculate Bayesian average (for sorting)
        const C = 10 // confidence factor
        const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
        const bayesianAverage = ratingCount > 0
          ? (C * meanRating + sumOfRatings) / (C + ratingCount)
          : undefined

        // Calculate true average (for display)
        const trueAverage = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

        const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            description: undefined,
            brand_logo_light: undefined,
            brand_logo_dark: undefined,
            productCount: 0,
            isProductLine: false
          },
          flavor_tags: product.flavor_tags || [],
          thumbnail: product.thumbnail,
          averageRating: bayesianAverage,
          trueAverage,
          ratingCount
        }
      })

      // Group products by flavor category
      const categoryGroups: FlavorCategory[] = categoriesWithMatches.map(category => {
        const categoryTags = categoryTagMap[category as keyof typeof categoryTagMap] || []
        const matchingCategoryTags = categoryTags.filter((tag: string) => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        const categoryProducts = transformedProducts.filter(product => 
          product.flavor_tags.some((tag: string) => categoryTags.includes(tag))
        )

        return {
          category,
          categoryDisplayName: formatCategoryName(category),
          matchingTags: matchingCategoryTags,
          products: categoryProducts
        }
      }).filter(category => category.products.length > 0)

      setFlavorCategories(categoryGroups)
    } catch (err) {
      console.error('Error fetching flavors:', err)
      setError('Error fetching flavors: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [searchQuery, supabase, getMeanRating])

  // Helper function to format category name for display
  function formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Load all search results
  const loadSearchResults = useCallback(async () => {
    if (!searchQuery) {
      setProducts([])
      setBrands([])
      setFlavorCategories([])
      setHasMoreProducts(false)
      setShowAllProducts(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Load initial products
      const initialProducts = await fetchProducts(1)
      setProducts(initialProducts)
      setProductPage(1)

      // Load brands and flavors in parallel
      await Promise.all([
        fetchBrands(),
        fetchFlavors()
      ])
    } catch (err) {
      console.error('Unexpected error in loadSearchResults:', err)
      setError('An unexpected error occurred: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, fetchProducts, fetchBrands, fetchFlavors])

  // Load more products
  const loadMoreProducts = useCallback(async () => {
    if (loadingRef.current || !hasMoreProducts || !searchQuery) return
    
    const nextPage = productPage + 1
    const newProducts = await fetchProducts(nextPage)
    
    if (newProducts.length > 0) {
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNewProducts]
      })
      setProductPage(nextPage)
    } else {
      setHasMoreProducts(false)
    }
  }, [productPage, hasMoreProducts, searchQuery, fetchProducts])

  const debouncedLoadMore = useDebounce(loadMoreProducts, 300)

  // Handle show more products
  const handleShowMoreProducts = useCallback(async () => {
    if (loadingRef.current || !hasMoreProducts || !searchQuery) return
    
    const nextPage = productPage + 1
    const newProducts = await fetchProducts(nextPage)
    
    if (newProducts.length > 0) {
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNewProducts]
      })
      setProductPage(nextPage)
      setShowAllProducts(true)
    } else {
      setHasMoreProducts(false)
    }
  }, [productPage, hasMoreProducts, searchQuery, fetchProducts])

  // Initial load and search query changes
  useEffect(() => {
    loadSearchResults()
  }, [loadSearchResults])

  // Infinite scroll for products
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 100 &&
        !loadingRef.current &&
        hasMoreProducts &&
        searchQuery &&
        debouncedLoadMore
      ) {
        debouncedLoadMore()
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [debouncedLoadMore, hasMoreProducts, searchQuery])

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    )
  }

  if (loading && !products.length && !brands.length && !flavorCategories.length) {
    return (
      <div className="text-center">
        Loading search results...
      </div>
    )
  }

  // Check if any results exist
  const hasAnyResults = products.length > 0 || brands.length > 0 || flavorCategories.length > 0

  if (!hasAnyResults && !loading) {
    return (
      <div className="text-center text-muted-foreground">
        No results found for "{searchQuery}". Try searching for a product name, brand, or flavor.
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Products Section */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Products ({products.length})
          </h2>
          <div className="grid gap-4">
            {products.slice(0, showAllProducts ? products.length : INITIAL_PRODUCTS_COUNT).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {loading && (
            <div className="text-center py-4 text-muted-foreground">
              Loading more products...
            </div>
          )}
          {!showAllProducts && products.length > INITIAL_PRODUCTS_COUNT && (
            <div className="text-center">
              <button
                onClick={handleShowMoreProducts}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Show More Products
              </button>
            </div>
          )}
          {showAllProducts && !hasMoreProducts && products.length > INITIAL_PRODUCTS_COUNT && (
            <div className="text-center py-4 text-muted-foreground">
              No more products to load
            </div>
          )}
        </div>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Brands ({brands.length})
          </h2>
          <BrandsGrid brands={brands} />
        </div>
      )}

      {/* Flavors Section */}
      {flavorCategories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Flavors ({flavorCategories.reduce((acc, cat) => acc + cat.matchingTags.length, 0)} matching tags)
          </h2>
          <div className="space-y-6">
            {flavorCategories.map((category) => (
              <div
                key={category.category}
                className="rounded-xl bg-card shadow-sm ring-1 ring-border overflow-hidden"
              >
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent sm:px-6 sm:py-4"
                >
                  <span className="text-base font-medium text-foreground sm:text-lg">
                    {category.categoryDisplayName}
                  </span>
                </button>
                
                <div className="px-4 py-3 border-t border-border sm:px-6 sm:py-4">
                  <div className="flex flex-wrap gap-2">
                    {category.matchingTags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}