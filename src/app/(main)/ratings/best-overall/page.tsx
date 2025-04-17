import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star } from 'lucide-react'

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
    `)

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Best Overall Sparkling Waters</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            The highest rated sparkling waters based on user ratings and reviews.
          </p>
        </div>
      </div>
    )
  }

  // Calculate average ratings and sort
  const productsWithRatings = products.map(product => {
    // Use ALL ratings regardless of approval status - approval only matters for review text
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
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Best Overall Sparkling Waters</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The highest rated sparkling waters based on user ratings and reviews.
        </p>
      </div>

      {productsWithRatings.length > 0 ? (
        <div className="space-y-4">
          {productsWithRatings.map((product, index) => (
            <Link
              key={product.id}
              href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
              className="group block rounded-xl bg-card h-[88px] p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all"
            >
              <div className="flex items-center gap-6 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    by {product.brand.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-foreground">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= product.averageRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-transparent text-yellow-400/25'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
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