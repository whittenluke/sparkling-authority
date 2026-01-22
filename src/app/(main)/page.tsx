import Link from 'next/link'
import { Crown, Cherry, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'
import { BrowseByFlavor } from '@/components/home/BrowseByFlavor'
import { BrowseByBrand } from '@/components/home/BrowseByBrand'

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

        {/* Top Rated Section */}
        {topProducts.length > 0 && (
          <div className="mt-24 max-w-3xl mx-auto w-full px-4 sm:px-0">
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
