import * as React from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuickRating } from '@/components/products/QuickRating'
import { WhereToBuy } from '@/components/products/WhereToBuy'
import { AffiliateDisclosure } from '@/components/products/AffiliateDisclosure'
import { NutritionDropdown } from '@/components/products/NutritionDropdown'
import { IngredientsDropdown } from '@/components/products/IngredientsDropdown'
import { AuthorityReviewSection } from '@/components/products/AuthorityReviewSection'
import { ProductReviewsSection } from '@/components/products/ProductReviewsSection'
import Link from 'next/link'
import { Metadata } from 'next'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import discontinuedBadge from '@/components/badges/discontinued-badge.png'
import { CarbonationProfileDropdown } from '@/components/products/CarbonationProfileDropdown'

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
    .select('name, verdict')
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
    description: product.verdict || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
    openGraph: {
      title: `${product.name} by ${brand.name}`,
      description: product.verdict || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
      type: 'website',
      url: `https://sparklingauthority.com/explore/brands/${brandSlug}/products/${productSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} by ${brand.name}`,
      description: product.verdict || `Discover ${product.name} by ${brand.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
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
  moderation_status: string | null
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
        slug,
        amazon_link,
        walmart_link,
        instacart_link,
        brand_website_link
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
      moderation_status,
      profiles (
        display_name
      )
    `)
    .eq('product_id', product.id)
    .order('created_at', { ascending: false }) as { data: ReviewData[] | null }

  // Ratings that count: rating-only (no text) or moderation_status === 'approved'
  const reviewsThatCount = ratingData?.filter(
    r => !r.review_text?.trim() || r.moderation_status === 'approved'
  ) ?? []
  const ratings = reviewsThatCount.map(r => r.overall_rating)
  const ratingCount = ratings.length
  const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
  const averageRating = ratingCount > 0 ? sumOfRatings / ratingCount : undefined

  // Get mean rating across all products for Bayesian average (only counting reviews)
  const { data: allProducts } = await supabase
    .from('products')
    .select(`
      reviews (
        overall_rating,
        review_text,
        moderation_status
      )
    `)

  const allRatings = allProducts?.flatMap(p =>
    (p.reviews ?? []).filter(
      (r: { overall_rating: number; review_text?: string | null; moderation_status?: string | null }) =>
        !r.review_text?.trim() || r.moderation_status === 'approved'
    ).map((r: { overall_rating: number }) => r.overall_rating)
  ) ?? []
  const meanRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Count reviews (rows with non-empty text and approved)
  const reviewCount = ratingData?.filter(
    r => r.review_text?.trim() && r.moderation_status === 'approved'
  ).length ?? 0

  // Get user's rating from the fetched data
  const userReview = session?.user
    ? ratingData?.find(r => r.user_id === session.user.id)
    : null

  const userRating = userReview?.overall_rating
  const userReviewText = userReview?.review_text || undefined

  // Review cards: non-empty text and (approved or own review)
  const filteredReviews =
    ratingData?.filter(
      r =>
        r.review_text?.trim() &&
        (r.moderation_status === 'approved' || r.user_id === session?.user?.id)
    ) ?? []

  return (
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
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left: Product Image (fixed) */}
              <div className="lg:w-[22rem] lg:shrink-0">
                {product.thumbnail ? (
                  <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none rounded-xl overflow-hidden flex items-center justify-center">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      width={560}
                      height={560}
                      className="w-full h-full object-contain"
                    />
                    {product.is_discontinued && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Image
                          src={discontinuedBadge}
                          alt=""
                          width={280}
                          height={280}
                          className="w-3/4 h-3/4 object-contain opacity-50"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none rounded-xl bg-muted flex items-center justify-center text-foreground text-8xl font-medium">
                    {product.name.charAt(0)}
                    {product.is_discontinued && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Image
                          src={discontinuedBadge}
                          alt=""
                          width={280}
                          height={280}
                          className="w-3/4 h-3/4 object-contain opacity-50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Product Info (constrained, not edge-to-edge) */}
              <div className="flex-1 min-w-0 max-w-2xl">
                {/* Two columns: Title/Brand/Rating (left, more space) | Flavor & Carbonation (right, stacked) */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,15rem)] gap-4 sm:gap-6 items-start">
                  <div className="min-w-0 space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                        {product.is_discontinued && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
                            Discontinued
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-lg text-muted-foreground">
                        by {product.brands.name}
                      </p>
                    </div>
                    {/* Rating – below title and brand */}
                    <QuickRating
                      productId={product.id}
                      productName={product.name}
                      brandName={product.brands.name}
                      initialRating={userRating}
                      initialReview={userReviewText}
                      averageRating={averageRating}
                      totalRatings={ratings.length}
                      totalReviews={reviewCount}
                      scrollToReviewsId="reviews"
                      size="large"
                    />
                  </div>
                  <div className="sm:pl-2 flex flex-col gap-4 w-full sm:w-auto">
                    {product.flavor_tags && product.flavor_tags.length > 0 && (
                      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Flavor
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {product.flavor_tags.map((flavor: string) => (
                            <span
                              key={flavor}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
                            >
                              {flavor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.carbonation_level != null && (
                      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Carbonation Intensity
                        </p>
                        <div className="flex items-center gap-1.5" aria-label={`Carbonation level ${product.carbonation_level} out of 10`}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <span
                              key={n}
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                n <= product.carbonation_level
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`}
                              aria-hidden
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold tabular-nums text-foreground">
                            {product.carbonation_level}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verdict section: own block with subtle border, toolbar + body */}
                <section
                  className="mt-6 rounded-xl border border-border bg-card/50 px-4 py-4 sm:px-5 sm:py-5 shadow-sm"
                  aria-labelledby="verdict-heading"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      {(product.verdict || product.review_full) && (
                        <h2 id="verdict-heading" className="text-xl font-semibold text-foreground">Verdict</h2>
                      )}
                    </div>
                    <WhereToBuy
                      amazonLink={product.amazon_link || product.brands.amazon_link}
                      walmartLink={product.walmart_link || product.brands.walmart_link}
                      instacartLink={product.instacart_link || product.brands.instacart_link}
                      brandLink={product.product_website_link || product.brands.brand_website_link}
                      brandName={product.brands.name}
                      className="my-0"
                    />
                  </div>
                  {(product.verdict || product.review_full) && (
                    <div className="mt-4 pt-2">
                      <AuthorityReviewSection verdict={product.verdict ?? null} reviewFull={product.review_full ?? null} />
                    </div>
                  )}
                </section>

                {/* Carbonation, Nutrition, Ingredients – same column as Verdict */}
                <div className="mt-6">
                  <CarbonationProfileDropdown
                    carbonationLevel={product.carbonation_level ?? null}
                    bubbleSize={product.bubble_size ?? null}
                    persistence={product.persistence ?? null}
                  />
                  <NutritionDropdown nutrition={nutrition} />
                  <IngredientsDropdown ingredients={nutrition.ingredients} />
                </div>

                {/* Affiliate Disclosure – same column as Verdict */}
                <div className="mt-8">
                  <AffiliateDisclosure />
                </div>
              </div>
            </div>

            {/* Reviews: filter left, cards right (cards same width as product info column) */}
            <section id="reviews" aria-label="Reviews" className="mt-8">
              <ProductReviewsSection
                reviews={filteredReviews}
                sessionUserId={session?.user?.id}
              />
            </section>
    </div>
  )
}
