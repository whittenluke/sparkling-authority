import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { PostgrestError } from '@supabase/supabase-js'

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

export default async function BestOverallPage() {
  const supabase = createClient()
  
  // Get products with their reviews
  const { data: products, error } = await supabase
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
    `) as { data: Product[] | null, error: PostgrestError | null }

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-clash-display text-3xl font-medium tracking-tight text-primary">Best Overall Sparkling Waters</h1>
          <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
            The highest rated sparkling waters based on user ratings and reviews.
          </p>
        </div>
      </div>
    )
  }

  // Calculate the mean rating across all products
  const allRatings = products?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
  const meanRating = allRatings.length > 0 
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length 
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Calculate average ratings and sort
  const productsWithRatings = products?.map(product => {
    // Use ALL ratings regardless of approval status - approval only matters for review text
    const ratings = product.reviews?.map(r => r.overall_rating) || []
    const ratingCount = ratings.length
    
    // Skip products with less than 3 reviews
    if (ratingCount < 3) {
      return {
        ...product,
        averageRating: 0,
        ratingCount: 0
      }
    }

    // Calculate Bayesian average
    const C = 3 // confidence factor
    const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
    const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

    return {
      ...product,
      averageRating: bayesianAverage,
      ratingCount
    }
  })
    .filter(p => p.ratingCount >= 3) // Only include products with 3+ reviews
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating
      }
      return b.ratingCount - a.ratingCount
    })
    .slice(0, 50) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-3xl font-medium tracking-tight text-primary">Best Overall Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The highest rated sparkling waters based on user ratings and reviews.
        </p>
      </div>

      {productsWithRatings.length > 0 ? (
        <div className="space-y-4">
          {productsWithRatings.map((product, index) => (
            <Link
              key={product.id}
              href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
              className="group block rounded-xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-6">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg sm:text-xl font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary break-words">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 sm:mt-1 text-sm text-muted-foreground">
                    by {product.brand.name}
                  </p>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1 sm:gap-1.5">
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
                  </div>
                  <span className="hidden sm:inline text-sm text-muted-foreground">
                    ({product.ratingCount} rating{product.ratingCount !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            No ratings available yet. Be the first to rate a product!
          </p>
        </div>
      )}
    </div>
  )
} 