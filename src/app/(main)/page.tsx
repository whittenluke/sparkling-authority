import Link from 'next/link'
import { Crown, Cherry, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'
import { BrowseByFlavor } from '@/components/home/BrowseByFlavor'
import { BrowseByBrand } from '@/components/home/BrowseByBrand'
import { UnflavoredChampions } from '@/components/home/UnflavoredChampions'
import { StrongestCarbonation } from '@/components/home/StrongestCarbonation'
import { CitrusCollection } from '@/components/home/CitrusCollection'
import { HomeHeroSearch } from '@/components/home/HomeHeroSearch'

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
    moderation_status: string | null
    review_text: string | null
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
          moderation_status,
          review_text
        )
      `) as { data: Product[] | null, error: PostgrestError | null }

    if (productsError) {
      console.error('🏠 Homepage: Products query error:', productsError)
      return <div className="text-center py-8">Service temporarily unavailable</div>
    }

    console.log(`🏠 Homepage: Fetched ${products?.length || 0} products`)

    // Helper: reviews that count (rating-only or approved)
    const reviewsThatCount = (reviews: Product['reviews']) =>
      (reviews ?? []).filter(r => !r.review_text?.trim() || r.moderation_status === 'approved')

    // Calculate the mean rating across all products (only counting reviews)
    const allRatings = products?.flatMap(p => reviewsThatCount(p.reviews).map(r => r.overall_rating)) ?? []
    const meanRating = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 3.5 // Fallback to 3.5 if no ratings exist

    // Calculate average ratings and sort
    const topProducts = products ? products.map(product => {
      const counting = reviewsThatCount(product.reviews)
      const ratings = counting.map(r => r.overall_rating)
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
      .slice(0, 8) : [] // Show top 8 for Best Overall

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
          overall_rating,
          moderation_status,
          review_text
        )
      `)
      .contains('flavor_categories', ['citrus'])
      .eq('is_discontinued', false)

    const citrusProducts = citrusProductsData ? citrusProductsData.map(product => {
      const counting = (product.reviews ?? []).filter((r: { overall_rating: number; review_text?: string | null; moderation_status?: string | null }) => !r.review_text?.trim() || r.moderation_status === 'approved')
      const ratings = counting.map((r: { overall_rating: number }) => r.overall_rating)
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
          moderation_status,
          review_text
        )
      `)
      .gte('carbonation_level', 8)
      .lte('carbonation_level', 10)
      .eq('is_discontinued', false) as { data: Product[] | null, error: PostgrestError | null }

    const strongestCarbonationProducts = strongestCarbonationData ? strongestCarbonationData.map(product => {
      const counting = reviewsThatCount(product.reviews)
      const ratings = counting.map(r => r.overall_rating)
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
    // (same filtering logic: citrus category, not discontinued, 5+ counting reviews)
    const citrusTotalCount = citrusProductsData ? citrusProductsData.filter(product => {
      const counting = (product.reviews ?? []).filter((r: { review_text?: string | null; moderation_status?: string | null }) => !r.review_text?.trim() || r.moderation_status === 'approved')
      return counting.length >= 5
    }).length : 0

    // Calculate total count of products that would appear on strongest-carbonation page
    // (same filtering logic: carbonation 8-10, not discontinued, 5+ counting reviews)
    const strongestCarbonationTotalCount = strongestCarbonationData ? strongestCarbonationData.filter(product => {
      const counting = reviewsThatCount(product.reviews)
      return counting.length >= 5
    }).length : 0

    return (
      <>
        {/* Page title and subtext – above the explore section */}
        <div className="pt-8">
          <h1 className="text-center font-clash-display text-4xl font-medium text-primary mb-4 sm:text-5xl">
            The Definitive Sparkling Water Database
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Objective ratings, carbonation metrics, and flavor profiles across a growing list of brands.
          </p>
        </div>

        {/* Explore section – search, “Explore by”, and cards in one visual block */}
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/5 px-4 py-8 sm:px-8 sm:py-10 mt-4">
          <div className="mb-10">
            <HomeHeroSearch />
          </div>
          <h2 className="text-center font-clash-display text-2xl font-medium text-primary mb-12 sm:text-3xl">
            Explore sparkling waters by
          </h2>

          {/* Main Exploration Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/explore/brands" className="group relative flex flex-col items-center text-center rounded-xl bg-card p-5 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Crown className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-clash-display font-semibold text-primary mb-1">Brand</h3>
              <p className="text-sm font-normal text-muted-foreground">Browse by maker</p>
            </Link>

            <Link href="/explore/flavors" className="group relative flex flex-col items-center text-center rounded-xl bg-card p-5 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Cherry className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-clash-display font-semibold text-primary mb-1">Flavor</h3>
              <p className="text-sm font-normal text-muted-foreground">Discover by taste</p>
            </Link>

            <Link href="/explore/carbonation" className="group relative flex flex-col items-center text-center rounded-xl bg-card p-5 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-primary transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-clash-display font-semibold text-primary mb-1">Carbonation</h3>
              <p className="text-sm font-normal text-muted-foreground">Search by intensity</p>
            </Link>
            </div>
        </section>

        {/* Strongest Carbonation Section */}
        <StrongestCarbonation products={strongestCarbonationProducts} />

        {/* Citrus Collection Section */}
        <CitrusCollection products={citrusProducts} />

        {/* Best Overall Section – same layout as Strongest Carbonation / Citrus: grid on desktop, horizontal scroll on mobile */}
        {topProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-clash-display text-2xl font-medium text-primary sm:text-3xl">
                Best Overall
              </h2>
              <Link
                href="/ratings/best-overall"
                className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="relative">
              {/* Desktop/Tablet: same grid as other sections */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Mobile: horizontal scroll, same as other sections */}
              <div className="md:hidden relative">
                <div className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth -mx-4 px-4">
                  <div className="flex gap-3 w-max">
                    {topProducts.map((product) => (
                      <div key={product.id} className="w-[160px] flex-shrink-0">
                        <CompactProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/ratings/best-overall"
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                View all best overall
              </Link>
            </div>
          </div>
        )}

        {/* Unflavored Champions Section */}
        <UnflavoredChampions products={unflavoredProducts} />

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
