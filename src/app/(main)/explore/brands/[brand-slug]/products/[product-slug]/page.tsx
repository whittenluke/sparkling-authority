import * as React from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuickRating } from '@/components/products/QuickRating'
import Link from 'next/link'
import { Metadata } from 'next'
import { Star } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    'brand-slug': string
    'product-slug': string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'brand-slug': brandSlug, 'product-slug': productSlug } = await params
  const supabase = createClient()
  
  // First get the brand to ensure it exists
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name')
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    return {
      title: 'Brand Not Found | Sparkling Authority',
      description: 'The requested brand could not be found.'
    }
  }

  // Then get the product using both brand ID and product slug
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('brand_id', brand.id)
    .eq('slug', productSlug)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found | Sparkling Authority',
      description: 'The requested product could not be found.'
    }
  }

  return {
    title: `${product.name} by ${brand.name} | Sparkling Authority`,
    description: product.description || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
    openGraph: {
      title: `${product.name} by ${brand.name}`,
      description: product.description || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
      type: 'website',
      url: `https://sparklingauthority.com/explore/brands/${brandSlug}/products/${productSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} by ${brand.name}`,
      description: product.description || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
    }
  }
}

type NutritionInfo = {
  calories: number
  total_fat: number
  sodium: number
  total_carbohydrates: number
  total_sugars: number
  protein: number
  serving_size: string
  ingredients: string
}

type ProductContainer = {
  container_type: string
  container_size: string
}

type ReviewData = {
  user_id: string
  created_at: string
  overall_rating: number
  review_text: string | null
  is_approved: boolean
  profiles: {
    display_name: string | null
  } | null
}

export default async function ProductPage({ params }: Props): Promise<React.ReactElement> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const resolvedParams = await params
  
  // First get the brand to ensure it exists
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, description')
    .eq('slug', resolvedParams['brand-slug'])
    .single()

  if (!brand) {
    return <div>Brand not found</div>
  }

  // Then get the product using both brand ID and product slug
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_lines (
        id,
        name,
        description
      ),
      product_containers (
        container_type,
        container_size
      ),
      brands (
        name,
        slug
      )
    `)
    .eq('brand_id', brand.id)
    .eq('slug', resolvedParams['product-slug'])
    .single()

  if (!product) {
    notFound()
  }

  const nutrition: NutritionInfo = product.nutrition_info

  // Group containers by type
  const containersByType = product.product_containers.reduce((acc: { [key: string]: string[] }, container: ProductContainer) => {
    if (!acc[container.container_type]) {
      acc[container.container_type] = [];
    }
    acc[container.container_type].push(container.container_size);
    return acc;
  }, {} as { [key: string]: string[] });

  // Fetch rating data - include both approved reviews and user's own reviews
  const { data: ratingData } = await supabase
    .from('reviews')
    .select(`
      user_id,
      created_at,
      overall_rating,
      review_text,
      is_approved,
      profiles (
        display_name
      )
    `)
    .eq('product_id', product.id)
    .order('created_at', { ascending: false }) as { data: ReviewData[] | null }

  // Calculate average rating
  const ratings = ratingData?.map(r => r.overall_rating) || []
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : undefined

  // Count reviews (rows with review_text)
  const reviewCount = ratingData?.filter(r => r.review_text?.trim()).length || 0

  // Get user's rating from the fetched data
  const userReview = session?.user 
    ? ratingData?.find(r => r.user_id === session.user.id)
    : null

  const userRating = userReview?.overall_rating
  const userReviewText = userReview?.review_text || undefined

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link 
                    href="/explore/brands"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link 
                    href={`/explore/brands/${resolvedParams['brand-slug']}`}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {brand.name}
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                </li>
              </ol>
            </nav>

            {/* Product Header */}
            <div>
              <div className="flex items-center gap-6">
                {/* Product Image Placeholder */}
                <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    by {product.brands.name}
                  </p>
                  
                  {/* Rating Section */}
                  <div className="mt-4">
                    <QuickRating
                      productId={product.id}
                      productName={product.name}
                      brandName={product.brands.name}
                      initialRating={userRating}
                      initialReview={userReviewText}
                      averageRating={averageRating}
                      totalRatings={ratings.length}
                      totalReviews={reviewCount}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="mt-6 text-muted-foreground">
                  {product.description}
                </p>
              )}

              {/* Product Quick Stats */}
              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Carbonation</dt>
                  <dd className="mt-1 text-lg font-medium text-foreground">
                    Level {product.carbonation_level}
                  </dd>
                </div>
                <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Calories</dt>
                  <dd className="mt-1 text-lg font-medium text-foreground">
                    {nutrition.calories}
                  </dd>
                </div>
                <div className="col-span-2 rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Available Containers</dt>
                  <dd className="mt-1 space-y-1">
                    {(Object.entries(containersByType) as [string, string[]][]).map(([type, sizes]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {type}:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {sizes.sort().join(', ')}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Flavor Tags */}
            <div>
              <h2 className="text-lg font-medium text-foreground">Flavors</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.flavor.map((flavor: string) => (
                  <span
                    key={flavor}
                    className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground ring-1 ring-inset ring-border"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
              <h2 className="text-lg font-medium text-foreground">Nutrition Facts</h2>
              <div className="mt-4 rounded-lg bg-card shadow-sm ring-1 ring-border">
                <dl className="divide-y divide-border">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Serving Size</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.serving_size}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Calories</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.calories}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Fat</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_fat}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Sodium</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.sodium}mg
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Carbohydrates</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_carbohydrates}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Sugars</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_sugars}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Protein</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.protein}g
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-medium text-foreground">Ingredients</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {nutrition.ingredients}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-foreground">Reviews</h2>
              <div className="mt-4 space-y-6">
                {ratingData
                  ?.filter(r => 
                    // Must have review text
                    r.review_text?.trim() && 
                    // And must be either approved or be the user's own review
                    (r.is_approved || r.user_id === session?.user?.id)
                  )
                  .map((review) => (
                    <div key={review.user_id} className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {review.profiles?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        {session?.user?.id === review.user_id && !review.is_approved && (
                          <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20">
                            Pending Review
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.overall_rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-transparent text-yellow-400/25'
                            }`}
                          />
                        ))}
                      </div>
                      {review.review_text && (
                        <p className="mt-3 text-foreground">
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}