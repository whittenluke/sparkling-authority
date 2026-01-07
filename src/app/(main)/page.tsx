import Link from 'next/link'
import { Crown, Cherry, Grid3x3, Sparkles, PartyPopper, MapPin, Star, Sparkles as SparklesIcon } from 'lucide-react'
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
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary sm:text-6xl text-center">
          Your Definitive Guide to Sparkling Water
        </h1>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          Expert reviews, flavor insights, and personalized recommendations for sparkling water enthusiasts
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/explore/products" 
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <SparklesIcon className="mr-2 h-5 w-5" />
          Find Your Perfect Fizz
        </Link>
        <Link 
          href="/ratings/best-overall" 
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-6 py-3 text-base font-semibold text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          <Star className="mr-2 h-5 w-5" />
          Browse Top-Rated Waters
        </Link>
      </div>

      {/* Browse by Flavor Section */}
      <BrowseByFlavor />

      {/* Best Overall Section */}
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

      {/* Main Navigation Cards */}
      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/explore/brands" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Crown className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Brands</h3>
        </Link>

        <Link href="/explore/flavors" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Cherry className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Flavors</h3>
        </Link>

        <Link href="/explore/products" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Grid3x3 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Products</h3>
        </Link>

        <Link href="/explore/new-releases" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore New Releases</h3>
        </Link>

        <Link href="/explore/regional" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Regional Favorites</h3>
        </Link>
      </div>

      {/* Mission Statement */}
      <div className="mt-24 bg-primary/5 rounded-2xl p-8">
        <h2 className="font-clash-display text-2xl font-medium text-primary mb-4">Why Sparkling Authority?</h2>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          At Sparkling Authority, we&apos;re dedicated to exploring the diverse world of sparkling water. Through testing and detailed reviews, we provide insights into flavor profiles, carbonation, and mineral composition across brands and products.
        </p>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80 mt-4">
          Whether you&apos;re discovering new options, comparing popular favorites, or deepening your appreciation for subtle differences, our platform offers the expertise and community to enhance your sparkling water experience.
        </p>
      </div>
    </>
  )
} 