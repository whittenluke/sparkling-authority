import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { RegionalBrands } from './components/RegionalBrands'

export const dynamic = 'force-dynamic'

export default async function RegionalPage() {
  const supabase = createClient()
  
  // Get all brands with their country
  const { data: brands, error } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      country_of_origin
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Regional Favorites</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Explore sparkling water brands from around the world and discover regional specialties.
              </p>
            </div>

            <RegionalBrands brandsByCountry={brandsByCountry} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 