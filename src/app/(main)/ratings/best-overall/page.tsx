import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PostgrestError } from '@supabase/supabase-js'
import { CompactProductCard } from '@/app/(main)/explore/products/components/CompactProductCard'

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
    moderation_status: string | null
    review_text: string | null
  }>
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount?: number
}

export const dynamic = 'force-dynamic'

export default async function BestOverallPage() {
  const supabase = createClient()

  // Get products with their reviews
  const { data: products, error } = await supabase
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

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Best Overall Sparkling Waters</h1>
          <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
            The highest rated sparkling waters based on user ratings and reviews.
          </p>
        </div>
      </div>
    )
  }

  const reviewsThatCount = (reviews: Product['reviews']) =>
    (reviews ?? []).filter(r => !r.review_text?.trim() || r.moderation_status === 'approved')

  // Calculate the mean rating across all products (only counting reviews)
  const allRatings = products?.flatMap(p => reviewsThatCount(p.reviews).map(r => r.overall_rating)) ?? []
  const meanRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Calculate average ratings and sort
  const productsWithRatings = products?.map(product => {
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
    .slice(0, 50) || []

  return (
    <div className="space-y-8 min-w-0 overflow-x-hidden">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Best Overall Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The highest rated sparkling waters based on user ratings and reviews.
        </p>
      </div>

      {productsWithRatings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productsWithRatings.map((product, index) => {
            const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
            return (
              <div key={product.id} className="relative">
                <div className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold ring-1 ring-border">
                  {index + 1}
                </div>
                <CompactProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    brand: { id: brand.id, name: brand.name, slug: brand.slug },
                    thumbnail: product.thumbnail ?? null,
                    trueAverage: product.trueAverage,
                    ratingCount: product.ratingCount ?? 0,
                  }}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center">
          <p className="font-plus-jakarta text-lg text-muted-foreground mb-4">
            No ratings available yet.
          </p>
          <Link
            href="/explore/products"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Rate your favorite products!
          </Link>
        </div>
      )}
    </div>
  )
}
