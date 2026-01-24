import Link from 'next/link'
import { Crown, Cherry, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'
import { BrowseByFlavor } from '@/components/home/BrowseByFlavor'
import { BrowseByBrand } from '@/components/home/BrowseByBrand'
import { UnflavoredChampions } from '@/components/home/UnflavoredChampions'
import { StrongestCarbonation } from '@/components/home/StrongestCarbonation'
import { CitrusCollection } from '@/components/home/CitrusCollection'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  flavor_tags: string[]
  thumbnail?: string | null
  brand: Brand
  carbonation_level?: number
  reviews?: Array<{
    overall_rating: number
    is_approved: boolean
  }>
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount?: number
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()

  try {
    console.log('🏠 Homepage: Starting load at', new Date().toISOString())

    // Get products with their reviews (using JOIN like best-overall page)
    const { data: products, error: productsError } = await supabase
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
          is_approved
        )
      `) as { data: Product[] | null, error: PostgrestError | null }

    if (productsError) {
      console.error('🏠 Homepage: Products query error:', productsError)
      return <div className="text-center py-8">Service temporarily unavailable</div>
    }

    console.log(`🏠 Homepage: Fetched ${products?.length || 0} products`)

    // Calculate the mean rating across all products
    const allRatings = products?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
    const meanRating = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 3.5 // Fallback to 3.5 if no ratings exist

    // Calculate average ratings and sort
    const topProducts = products ? products.map(product => {
      // Use ALL ratings regardless of approval status - approval only matters for review text
      const ratings = product.reviews?.map(r => r.overall_rating) || []
      const ratingCount = ratings.length

      // Skip products with less than 5 reviews
      if (ratingCount < 5) {
        return {
          ...product,
          averageRating: 0,
          ratingCount: 0
        }
      }

      // Calculate Bayesian average (for sorting)
      const C = 10 // confidence factor
      const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
      const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

      // Calculate true average (for display)
      const trueAverage = sumOfRatings / ratingCount

      return {
        ...product,
        averageRating: bayesianAverage,
        trueAverage: trueAverage,
        ratingCount
      }
    })
      .filter(p => p.ratingCount >= 5) // Only include products with 5+ reviews
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating
        }
        return b.ratingCount - a.ratingCount
      })
      .slice(0, 5) : [] // Show top 5 products

    // Get total count of unflavored products
    const { count: unflavoredTotalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .overlaps('flavor_tags', ['unflavored', 'natural', 'neutral', 'plain'])

    // Get unflavored products for horizontal scroll section
    const { data: unflavoredProductsData, error: unflavoredError } = await supabase
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
      .overlaps('flavor_tags', ['unflavored', 'natural', 'neutral', 'plain'])
      .order('name')

    const unflavoredProducts = unflavoredProductsData ? unflavoredProductsData.map(product => {
      const ratings = product.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
      const ratingCount = ratings.length

      // Calculate Bayesian average (for sorting)
      const C = 10 // confidence factor
      const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
      const bayesianAverage = ratingCount > 0
        ? (C * meanRating + sumOfRatings) / (C + ratingCount)
        : undefined

      // Calculate true average (for display)
      const trueAverage = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        flavor_tags: product.flavor_tags || [],
        thumbnail: product.thumbnail,
        brand: Array.isArray(product.brand) ? product.brand[0] : product.brand,
        averageRating: bayesianAverage,
        trueAverage,
        ratingCount
      }
    })
      .filter(p => p.ratingCount >= 3) // Lower threshold for unflavored section
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating && b.averageRating && a.averageRating) {
          return b.averageRating - a.averageRating
        }
        return b.ratingCount - a.ratingCount
      })
      .slice(0, 8) : [] // Show top 8 products for horizontal scroll

    // Get citrus products for horizontal scroll section
    const { data: citrusProductsData, error: citrusError } = await supabase
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
      .contains('flavor_categories', ['citrus'])
      .eq('is_discontinued', false)

    const citrusProducts = citrusProductsData ? citrusProductsData.map(product => {
      const ratings = product.reviews?.map((r: { overall_rating: number }) => r.overall_rating) || []
      const ratingCount = ratings.length

      // Skip products with less than 5 reviews
      if (ratingCount < 5) {
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          flavor_tags: product.flavor_tags || [],
          thumbnail: product.thumbnail,
          brand: Array.isArray(product.brand) ? product.brand[0] : product.brand,
          averageRating: 0,
          ratingCount: 0
        }
      }

      // Calculate Bayesian average (for sorting)
      const C = 10 // confidence factor
      const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
      const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

      // Calculate true average (for display)
      const trueAverage = sumOfRatings / ratingCount

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        flavor_tags: product.flavor_tags || [],
        thumbnail: product.thumbnail,
        brand: Array.isArray(product.brand) ? product.brand[0] : product.brand,
        averageRating: bayesianAverage,
        trueAverage,
        ratingCount
      }
    })
      .filter(p => p.ratingCount >= 5) // Only include products with 5+ reviews
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating && b.averageRating && a.averageRating) {
          return b.averageRating - a.averageRating
        }
        return b.ratingCount - a.ratingCount
      })
      .slice(0, 8) : [] // Show top 8 products for horizontal scroll

    // Get strongest carbonation products for horizontal scroll section
    const { data: strongestCarbonationData, error: strongestCarbonationError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        flavor_tags,
        thumbnail,
        carbonation_level,
        brand:brand_id (
          id,
          name,
          slug
        ),
        reviews (
          overall_rating,
          is_approved
        )
      `)
      .gte('carbonation_level', 8)
      .lte('carbonation_level', 10)
      .eq('is_discontinued', false) as { data: Product[] | null, error: PostgrestError | null }

    const strongestCarbonationProducts = strongestCarbonationData ? strongestCarbonationData.map(product => {
      // Use ALL ratings regardless of approval status - approval only matters for review text
      const ratings = product.reviews?.map(r => r.overall_rating) || []
      const ratingCount = ratings.length

      // Skip products with less than 5 reviews
      if (ratingCount < 5) {
        return {
          ...product,
          averageRating: 0,
          ratingCount: 0
        }
      }

      // Calculate Bayesian average (for sorting)
      const C = 10 // confidence factor
      const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
      const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

      // Calculate true average (for display)
      const trueAverage = sumOfRatings / ratingCount

      return {
        ...product,
        averageRating: bayesianAverage,
        trueAverage: trueAverage,
        ratingCount
      }
    })
      .filter(p => p.ratingCount >= 5) // Only include products with 5+ reviews
      .sort((a, b) => {
        // First sort by carbonation level (highest first)
        if (a.carbonation_level !== b.carbonation_level) {
          return b.carbonation_level! - a.carbonation_level!
        }
        // Then by Bayesian average
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating
        }
        // Finally by rating count
        return b.ratingCount - a.ratingCount
      })
      .slice(0, 8) : [] // Show top 8 products for horizontal scroll

    // Calculate total count of products that would appear on citrus page
    // (same filtering logic: citrus category, not discontinued, 5+ reviews)
    const citrusTotalCount = citrusProductsData ? citrusProductsData.filter(product => {
      const ratings = product.reviews?.map(r => r.overall_rating) || []
      return ratings.length >= 5
    }).length : 0

    // Calculate total count of products that would appear on strongest-carbonation page
    // (same filtering logic: carbonation 8-10, not discontinued, 5+ reviews)
    const strongestCarbonationTotalCount = strongestCarbonationData ? strongestCarbonationData.filter(product => {
      const ratings = product.reviews?.map(r => r.overall_rating) || []
      return ratings.length >= 5
    }).length : 0

    return (
      <>
        {/* Exploration Section */}
        <div className="">
          <h2 className="text-center font-clash-display text-3xl font-medium text-primary mb-8">
            Explore sparkling waters by
          </h2>

          {/* Main Exploration Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Link href="/explore/brands" className="group relative block rounded-2xl bg-card p-6 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Crown className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-clash-display font-medium text-primary">Brand</h3>
            </Link>

            <Link href="/explore/flavors" className="group relative block rounded-2xl bg-card p-6 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Cherry className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-clash-display font-medium text-primary">Flavor</h3>
            </Link>

            <Link href="/explore/products" className="group relative block rounded-2xl bg-card p-6 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Grid3x3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-clash-display font-medium text-primary">All Products</h3>
            </Link>
          </div>
        </div>

        {/* Strongest Carbonation Section */}
        <StrongestCarbonation products={strongestCarbonationProducts} totalCount={strongestCarbonationTotalCount || undefined} />

        {/* Citrus Collection Section */}
        <CitrusCollection products={citrusProducts} totalCount={citrusTotalCount || undefined} />

        {/* Unflavored Champions Section */}
        <UnflavoredChampions products={unflavoredProducts} totalCount={unflavoredTotalCount || undefined} />

        {/* Top Rated Section */}
        {topProducts.length > 0 && (
          <div className="mt-16 max-w-3xl mx-auto w-full px-4 sm:px-0">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/ratings/best-overall"
                className="font-clash-display text-xl sm:text-2xl font-medium text-primary hover:text-primary/90"
              >
                Top Rated
              </Link>
              <Link
                href="/ratings/best-overall"
                className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
              >
                View All Top Rated
              </Link>
            </div>

            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="relative">
                  <div className="absolute left-6 top-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-medium z-10">
                    {index + 1}
                  </div>
                  <div className="pl-24">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/ratings/best-overall"
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                View all top rated
              </Link>
            </div>
          </div>
        )}

        {/* Browse by Brand Section */}
        <BrowseByBrand />

        {/* Browse by Flavor Section */}
        <BrowseByFlavor />

        {/* About Section */}
        <div className="mt-24 max-w-2xl mx-auto text-center">
          <h2 className="font-clash-display text-xl font-medium text-primary mb-3">About</h2>
          <p className="font-plus-jakarta text-base leading-7 text-primary/70">
            Sparkling Authority organizes and indexes sparkling water products by flavor, brand, and user ratings. We help you discover options and make informed choices in a crowded category.
          </p>
        </div>
      </>
    )
  } catch (error) {
    console.error('🏠 Homepage: Unexpected error:', error)
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Service Temporarily Unavailable</h2>
        <p className="text-muted-foreground mb-4">We&apos;re experiencing technical difficulties. Please try again in a moment.</p>
        <Link href="/" className="text-primary hover:underline">Refresh Page</Link>
      </div>
    )
  }
}
