import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PostgrestError } from '@supabase/supabase-js'
import { ProductCard } from '@/app/(main)/explore/products/components/ProductCard'

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
  carbonation_level: number
  reviews?: Array<{
    overall_rating: number
    is_approved: boolean
  }>
  averageRating?: number
  ratingCount?: number
}

export const dynamic = 'force-dynamic'

export default async function StrongestCarbonationPage() {
  const supabase = createClient()

  // Get products with carbonation levels 8-10 and their reviews
  const { data: products, error } = await supabase
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

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Strongest Carbonation</h1>
          <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
            The most intensely carbonated sparkling waters, ranked by bubble strength and effervescence.
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

  // Group products by carbonation level and calculate ratings
  const levelGroups = [10, 9, 8].map(level => {
    const levelProducts = products?.filter(p => p.carbonation_level === level) || []

    const productsWithRatings = levelProducts.map(product => {
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

    return {
      level,
      products: productsWithRatings
    }
  })

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 10:
        return 'LEVEL 10 – Maximum Fizz'
      case 9:
        return 'LEVEL 9 – Very Strong'
      case 8:
        return 'LEVEL 8 – Strong'
      default:
        return `LEVEL ${level}`
    }
  }

  const hasAnyProducts = levelGroups.some(group => group.products.length > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Strongest Carbonation</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The most intensely carbonated sparkling waters, ranked by bubble strength and effervescence.
        </p>
      </div>

      {hasAnyProducts ? (
        <div className="space-y-12">
          {levelGroups.map(({ level, products }) => (
            products.length > 0 && (
              <div key={level} className="space-y-6">
                <h2 className="font-clash-display text-2xl font-medium tracking-tight text-primary border-b border-border pb-2">
                  {getLevelTitle(level)}
                </h2>
                <div className="space-y-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="font-plus-jakarta text-lg text-muted-foreground mb-4">
            No highly carbonated products with ratings available yet.
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
