import { createClient } from '@/lib/supabase/server'
import { RegionalBrands } from './components/RegionalBrands'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Regional Favorites | Sparkling Authority',
    description: 'Explore sparkling water brands from around the world. Discover regional specialties and unique flavors from different countries.',
    openGraph: {
      title: 'Regional Favorites | Sparkling Authority',
      description: 'Explore sparkling water brands from around the world. Discover regional specialties and unique flavors from different countries.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/regional',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Regional Favorites | Sparkling Authority',
      description: 'Explore sparkling water brands from around the world. Discover regional specialties and unique flavors from different countries.',
    }
  }
}

export default async function RegionalPage() {
  const supabase = createClient()
  
  // Get all brands with their country
  const { data: brands, error } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      country_of_origin,
      slug
    `)
    .order('name')

  if (error) {
    console.error('Error fetching brands:', error)
    return null
  }

  // Group brands by country
  const brandsByCountry = brands.reduce((acc: { [key: string]: typeof brands }, brand) => {
    const country = brand.country_of_origin || 'Unknown'
    if (!acc[country]) {
      acc[country] = []
    }
    acc[country].push(brand)
    // Sort brands within each country by name
    acc[country].sort((a, b) => a.name.localeCompare(b.name))
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Regional Favorites</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          Explore sparkling water brands from around the world and discover regional specialties.
        </p>
      </div>

      <RegionalBrands brandsByCountry={brandsByCountry} />
    </div>
  )
} 