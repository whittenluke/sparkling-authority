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
  brand: Brand
  reviews?: Array<{
    overall_rating: number
    is_approved: boolean
  }>
  averageRating?: number
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

export default async function ProductsPage() {
  const supabase = createClient()
  
  // Get products with their reviews for top rated section
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

  // Calculate average ratings and sort to get top 10
  const topRatedProducts = products ? products.map(product => {
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
    .slice(0, 10) : [] // Top 10 products

  return <ProductsContent topRatedProducts={topRatedProducts} />
}
