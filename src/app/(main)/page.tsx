import Link from 'next/link'
import { Crown, Cherry, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'
import { BrowseByFlavor } from '@/components/home/BrowseByFlavor'

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
  averageRating?: number
  ratingCount?: number
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  
  // Get products with their reviews
  const { data: products } = await supabase
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
    `) as { data: Product[] | null }

  // Calculate the mean rating across all products
  const allRatings = products?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
  const meanRating = allRatings.length > 0 
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length 
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Calculate average ratings and sort
  const topProducts = products ? products.map(product => {
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

    // Calculate Bayesian average
    const C = 10 // confidence factor
    const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
    const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

    return {
      ...product,
      averageRating: bayesianAverage,
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
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto space-y-3 text-center">
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary sm:text-6xl">
          Sparkling water, finally organized.
        </h1>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          Find, compare, and explore brands and flavors in one place
        </p>
      </div>

      {/* Main Exploration Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Link href="/explore/brands" className="group relative block rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border hover:ring-primary transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Crown className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore by Brand</h3>
        </Link>

        <Link href="/explore/flavors" className="group relative block rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border hover:ring-primary transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Cherry className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore by Flavor</h3>
        </Link>

        <Link href="/explore/products" className="group relative block rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border hover:ring-primary transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Grid3x3 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Browse All Products</h3>
        </Link>
      </div>

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
} 