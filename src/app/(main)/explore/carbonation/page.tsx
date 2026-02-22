import { createClient } from '@/lib/supabase/server'
import { CarbonationSpectrum } from './components/CarbonationSpectrum'
import { Metadata } from 'next'

type Product = {
  id: string
  name: string
  carbonation_level: number
  slug: string
  thumbnail?: string | null
  brand: {
    id: string
    name: string
    slug: string
    brand_logo_light?: string | null
    brand_logo_dark?: string | null
  }
  trueAverage?: number
  ratingCount: number
  reviews?: Array<{ overall_rating: number; moderation_status?: string | null; review_text?: string | null }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Carbonation Levels | Sparkling Authority',
    description: 'Discover sparkling waters based on their carbonation intensity, from subtle bubbles to intense effervescence. Find your perfect level of fizz.',
    openGraph: {
      title: 'Carbonation Levels | Sparkling Authority',
      description: 'Discover sparkling waters based on their carbonation intensity, from subtle bubbles to intense effervescence. Find your perfect level of fizz.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/carbonation',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Carbonation Levels | Sparkling Authority',
      description: 'Discover sparkling waters based on their carbonation intensity, from subtle bubbles to intense effervescence. Find your perfect level of fizz.',
    }
  }
}

export const dynamic = 'force-dynamic'

export default async function CarbonationPage() {
  const supabase = createClient()
  
  // Get all products with thumbnail and reviews (same pattern as homepage / Strongest Carbonation)
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      carbonation_level,
      slug,
      thumbnail,
      brand:brand_id (
        id,
        name,
        slug,
        brand_logo_light,
        brand_logo_dark
      ),
      reviews (
        overall_rating,
        moderation_status,
        review_text
      )
    `)
    .order('name')
    .order('carbonation_level')

  if (error) {
    console.error('Error fetching products:', error)
    return null
  }

  // Same helper as homepage: reviews that count (rating-only or approved)
  const reviewsThatCount = (reviews: Product['reviews']) =>
    (reviews ?? []).filter(r => !r.review_text?.trim() || r.moderation_status === 'approved')

  // Group products by carbonation level; enrich with trueAverage and ratingCount like other pages
  const productsByLevel = (products ?? []).reduce((acc: { [key: number]: Product[] }, product) => {
    const level = product.carbonation_level
    if (!acc[level]) {
      acc[level] = []
    }
    const counting = reviewsThatCount(product.reviews)
    const ratings = counting.map(r => r.overall_rating)
    const ratingCount = ratings.length
    const trueAverage = ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : undefined

    const rawBrand = Array.isArray(product.brand) ? product.brand[0] : product.brand
    const transformedProduct: Product = {
      id: product.id,
      name: product.name,
      carbonation_level: product.carbonation_level,
      slug: product.slug,
      thumbnail: product.thumbnail ?? null,
      brand: {
        id: rawBrand.id,
        name: rawBrand.name,
        slug: rawBrand.slug,
        brand_logo_light: rawBrand.brand_logo_light ?? null,
        brand_logo_dark: rawBrand.brand_logo_dark ?? null
      },
      trueAverage,
      ratingCount
    }
    acc[level].push(transformedProduct)
    acc[level].sort((a, b) => a.name.localeCompare(b.name))
    return acc
  }, {})

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Carbonation Levels</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          Discover sparkling waters based on their carbonation intensity, from subtle bubbles to intense effervescence.
        </p>
      </div>

      {/* Carbonation Spectrum */}
      <div className="rounded-xl p-6">
        <CarbonationSpectrum productsByLevel={productsByLevel} />
      </div>
    </div>
  )
} 