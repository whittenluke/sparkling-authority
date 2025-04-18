import { createClient } from '@/lib/supabase/server'
import { CarbonationSpectrum } from './components/CarbonationSpectrum'
import { Metadata } from 'next'

type Product = {
  id: string
  name: string
  carbonation_level: number
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
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
  
  // Get all products grouped by carbonation level
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      carbonation_level,
      slug,
      brand:brand_id (
        id,
        name,
        slug
      )
    `)
    .order('name')
    .order('carbonation_level')

  if (error) {
    console.error('Error fetching products:', error)
    return null
  }

  // Group products by carbonation level and ensure they're sorted by name
  const productsByLevel = products.reduce((acc: { [key: number]: Product[] }, product) => {
    const level = product.carbonation_level
    if (!acc[level]) {
      acc[level] = []
    }
    // Transform the data to match the Product type
    const transformedProduct: Product = {
      id: product.id,
      name: product.name,
      carbonation_level: product.carbonation_level,
      slug: product.slug,
      brand: Array.isArray(product.brand) ? product.brand[0] : product.brand
    }
    acc[level].push(transformedProduct)
    // Sort each level's products by name
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