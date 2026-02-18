'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { CompactProductCard } from './CompactProductCard'
import { BrandsGrid } from '@/app/(main)/explore/brands/components/BrandsGrid'
import { calculateMeanRating, transformProductWithRatings } from '@/lib/product-utils'

type Scope = 'products' | 'brands'

interface SearchResultsProps {
  searchQuery: string
  scope: Scope
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
  thumbnail?: string | null
  trueAverage?: number
  ratingCount: number
}

type SupabaseBrandData = {
  id: string
  name: string
  slug: string
}

type ReviewRow = {
  overall_rating: number
  moderation_status?: string | null
  review_text?: string | null
}

type SupabaseProductData = {
  id: string
  name: string
  slug: string
  flavor_tags: string[] | null
  thumbnail: string | null
  brand: SupabaseBrandData | SupabaseBrandData[]
  reviews?: Array<ReviewRow> | null
}

function reviewsThatCount(reviews: Array<ReviewRow> | null | undefined): Array<{ overall_rating: number }> {
  return (reviews ?? []).filter(r => !r.review_text?.trim() || r.moderation_status === 'approved')
}

// Helper to convert SupabaseProductData to ProductWithReviews format (only counting reviews)
function toProductWithReviews(product: SupabaseProductData): {
  id: string
  name: string
  slug: string
  flavor_tags: string[] | null
  thumbnail: string | null
  brand: SupabaseBrandData | SupabaseBrandData[]
  reviews?: Array<{ overall_rating: number }>
} {
  return {
    ...product,
    reviews: reviewsThatCount(product.reviews)
  }
}

const INITIAL_PRODUCTS_COUNT = 16

export function SearchResults({ searchQuery, scope }: SearchResultsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const supabase = createClientComponentClient()

  // Fetch products with smart search logic
  const fetchProducts = useCallback(async () => {
    if (!searchQuery || scope !== 'products') {
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)

    try {
  // Get mean rating for Bayesian average calculation
      const { data: allProductsData } = await supabase
      .from('products')
      .select(`
        reviews (
          overall_rating
        )
      `)

      const allProducts = allProductsData || []
      const meanRating = calculateMeanRating(allProducts)

      // Get matching brand IDs
      const { data: matchingBrands } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('name', `%${searchQuery}%`)

      const brandIds = matchingBrands?.map(b => b.id) || []
      const brandNames = matchingBrands?.map(b => b.name.toLowerCase()) || []

      // Find matching flavor tags (case-insensitive)
      const searchLower = searchQuery.toLowerCase()
      const { data: allProductsWithTags } = await supabase
        .from('products')
        .select('flavor_tags')

      const allFlavorTags = new Set<string>()
      allProductsWithTags?.forEach(p => {
        p.flavor_tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(searchLower)) {
            allFlavorTags.add(tag)
          }
        })
      })
      const matchingFlavorTags = Array.from(allFlavorTags)

      // Build queries for different priority levels
      let priority1Products: SupabaseProductData[] = [] // Product name match
      let priority2Products: SupabaseProductData[] = [] // Brand AND Flavor match
      const priority3Products: SupabaseProductData[] = [] // Brand OR Flavor match

      // Priority 1: Product name match
      if (searchQuery.length >= 2) {
        const { data: nameMatchData } = await supabase
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
            overall_rating,
            moderation_status,
            review_text
          )
        `)
          .ilike('name', `%${searchQuery}%`)
          .order('name', { ascending: true })

        if (nameMatchData) {
          priority1Products = nameMatchData as SupabaseProductData[]
        }
      }

      // Priority 2: Brand AND Flavor match
      if (brandIds.length > 0 && matchingFlavorTags.length > 0) {
        const { data: brandAndFlavorData } = await supabase
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
              overall_rating,
              moderation_status,
              review_text
            )
          `)
          .in('brand_id', brandIds)
          .overlaps('flavor_tags', matchingFlavorTags)
          .order('name', { ascending: true })

        if (brandAndFlavorData) {
          // Filter out products already in priority 1
          const priority1Ids = new Set(priority1Products.map(p => p.id))
          priority2Products = brandAndFlavorData.filter(p => !priority1Ids.has(p.id)) as SupabaseProductData[]
        }
      }

      // Priority 3: Brand OR Flavor match (fallback)
      // Get products matching flavor tags
      if (matchingFlavorTags.length > 0) {
        const { data: flavorData } = await supabase
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
              overall_rating,
              moderation_status,
              review_text
            )
          `)
          .overlaps('flavor_tags', matchingFlavorTags)
          .order('name', { ascending: true })

        if (flavorData) {
          const priority1And2Ids = new Set([
            ...priority1Products.map(p => p.id),
            ...priority2Products.map(p => p.id)
          ])
          const flavorOnlyProducts = flavorData.filter(p => !priority1And2Ids.has(p.id))
          priority3Products.push(...flavorOnlyProducts)
        }
      }

      // Get products matching brand IDs (but not already in priority 1, 2, or 3)
      if (brandIds.length > 0) {
        const { data: brandData } = await supabase
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
              overall_rating,
              moderation_status,
              review_text
            )
          `)
          .in('brand_id', brandIds)
          .order('name', { ascending: true })

        if (brandData) {
          const priority1And2And3Ids = new Set([
            ...priority1Products.map(p => p.id),
            ...priority2Products.map(p => p.id),
            ...priority3Products.map(p => p.id)
          ])
          const brandOnlyProducts = brandData.filter(p => !priority1And2And3Ids.has(p.id))
          priority3Products.push(...brandOnlyProducts)
        }
      }

      // Combine all products in priority order
      const allMatchingProducts = [
        ...priority1Products,
        ...priority2Products,
        ...priority3Products
      ]

      // Transform products with ratings
      const transformedProducts: Product[] = allMatchingProducts.map(product => {
        const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
        const productWithReviews = toProductWithReviews(product)
        const productWithRatings = transformProductWithRatings(productWithReviews, meanRating)

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
          thumbnail: product.thumbnail,
          trueAverage: productWithRatings.trueAverage,
          ratingCount: productWithRatings.ratingCount
        }
      })

      // Sort by relevance within each priority group, then alphabetically
      const sortedProducts = transformedProducts.sort((a, b) => {
        const searchLower = searchQuery.toLowerCase()
        const aNameLower = a.name.toLowerCase()
        const bNameLower = b.name.toLowerCase()

        // Exact name match comes first
        const aExactMatch = aNameLower === searchLower
        const bExactMatch = bNameLower === searchLower
        if (aExactMatch && !bExactMatch) return -1
        if (!aExactMatch && bExactMatch) return 1

        // Then partial name match
        const aPartialMatch = aNameLower.includes(searchLower)
        const bPartialMatch = bNameLower.includes(searchLower)
        if (aPartialMatch && !bPartialMatch) return -1
        if (!aPartialMatch && bPartialMatch) return 1

        // Check brand match
        const aBrandMatch = brandNames.some(brandName => 
          a.brand.name.toLowerCase().includes(brandName)
        )
        const bBrandMatch = brandNames.some(brandName => 
          b.brand.name.toLowerCase().includes(brandName)
        )
        if (aBrandMatch && !bBrandMatch) return -1
        if (!aBrandMatch && bBrandMatch) return 1

        // Final tie-breaker: alphabetical
        return a.name.localeCompare(b.name)
      })

      setProducts(sortedProducts)
      setShowAllProducts(false)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error fetching products: ' + (err instanceof Error ? err.message : String(err)))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, scope, supabase])

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    if (!searchQuery || scope !== 'brands') {
      setBrands([])
      return
    }

    setLoading(true)
    setError(null)

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
      setBrands([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, scope, supabase])

  // Load search results based on scope
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setProducts([])
      setBrands([])
      setShowAllProducts(false)
      return
    }

    if (scope === 'products') {
      fetchProducts()
    } else if (scope === 'brands') {
      fetchBrands()
    }
  }, [searchQuery, scope, fetchProducts, fetchBrands])

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    )
  }

  if (loading && products.length === 0 && brands.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading search results...
      </div>
    )
  }

  // Check if any results exist
  const hasAnyResults = products.length > 0 || brands.length > 0

  if (!hasAnyResults && !loading && searchQuery.length >= 2) {
    const scopeText = scope === 'products' ? 'products' : 'brands'
    return (
      <div className="text-center text-muted-foreground py-8">
        No {scopeText} found for &quot;{searchQuery}&quot;. Try a different search term.
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full">
      {/* Products Section */}
      {scope === 'products' && products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Products ({products.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.slice(0, showAllProducts ? products.length : INITIAL_PRODUCTS_COUNT).map((product) => (
              <CompactProductCard key={product.id} product={product} />
            ))}
          </div>
          {!showAllProducts && products.length > INITIAL_PRODUCTS_COUNT && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAllProducts(true)}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Show All Products ({products.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Brands Section */}
      {scope === 'brands' && brands.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Brands ({brands.length})
          </h2>
          <BrandsGrid brands={brands} />
        </div>
      )}
    </div>
  )
}
