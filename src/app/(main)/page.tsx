import Link from 'next/link'
import { Crown, Cherry, Grid3x3, Sparkles, PartyPopper, MapPin, Star, Sparkles as SparklesIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
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

  // Calculate average ratings and sort
  const topProducts = products ? products.map(product => {
    const ratings = product.reviews?.map(r => r.overall_rating) || []
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0
    return {
      ...product,
      averageRating,
      ratingCount: ratings.length
    }
  })
    .filter(p => p.ratingCount > 0)
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating
      }
      return b.ratingCount - a.ratingCount
    })
    .slice(0, 3) : []

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

      {/* Best Overall Section */}
      {topProducts.length > 0 && (
        <div className="mt-16 max-w-3xl mx-auto w-full px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-clash-display text-xl sm:text-2xl font-medium text-primary">Top Rated Sparkling Waters</h2>
            <Link 
              href="/ratings/best-overall"
              className="text-sm font-medium text-primary hover:text-primary/90"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
                className="group block rounded-xl bg-card h-[88px] p-4 sm:p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-6 h-full">
                  <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg sm:text-xl font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 text-muted-foreground">
                      by {product.brand.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-medium text-foreground">
                      {product.averageRating.toFixed(1)}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            star <= product.averageRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-transparent text-yellow-400/25'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="hidden sm:inline text-sm text-muted-foreground">
                      ({product.ratingCount} rating{product.ratingCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
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

        <Link href="/explore/carbonation" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Carbonation</h3>
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