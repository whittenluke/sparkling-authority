import { ProductsContent } from './components/ProductsContent'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Products | Sparkling Authority',
    description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
    openGraph: {
      title: 'Products | Sparkling Authority',
      description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/products',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Products | Sparkling Authority',
      description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
    }
  }
}

type ProductsPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = await searchParams
  const initialQuery = typeof resolved.q === 'string' ? resolved.q : ''

  const supabase = createClient()

  // Get products with their reviews for top rated section
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
        moderation_status,
        review_text
      )
    `) as { data: Product[] | null }

  const reviewsThatCount = (reviews: Product['reviews']) =>
    (reviews ?? []).filter(r => !r.review_text?.trim() || r.moderation_status === 'approved')

  // Calculate the mean rating across all products (only counting reviews)
  const allRatings = products?.flatMap(p => reviewsThatCount(p.reviews).map(r => r.overall_rating)) ?? []
  const meanRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Calculate average ratings and sort to get top 10
  const topRatedProducts = products ? products.map(product => {
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
    .slice(0, 10) : [] // Top 10 products

  return (
    <ProductsContent
      topRatedProducts={topRatedProducts}
      initialSearchQuery={initialQuery}
    />
  )
}
