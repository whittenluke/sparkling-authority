import { createClient } from '@/lib/supabase/server'
import { FlavorsList } from './components/FlavorsList'
import { FlavorsHeader } from './components/FlavorsHeader'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Flavors | Sparkling Authority',
    description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
    openGraph: {
      title: 'Flavors | Sparkling Authority',
      description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/flavors',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Flavors | Sparkling Authority',
      description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
    }
  }
}

export default async function FlavorsPage() {
  const supabase = createClient()
  
  // Get all unique flavors from products
  const { data: flavorsData, error } = await supabase
    .from('products')
    .select('flavor')
    .not('flavor', 'eq', '{}')
    .not('flavor', 'is', null)

  if (error) {
    console.error('Error fetching flavors:', error)
    return null
  }

  // Extract and flatten all flavors from products
  const allFlavors = flavorsData?.reduce((acc: string[], product) => {
    return acc.concat(product.flavor || [])
  }, [])

  // Get unique flavors and sort alphabetically
  const uniqueFlavors = [...new Set(allFlavors)].sort()

  return (
    <div className="space-y-6">
      <FlavorsHeader />
      
      {uniqueFlavors.length === 0 ? (
        <div className="rounded-xl bg-card p-6 text-center">
          <p className="font-plus-jakarta text-muted-foreground">No flavors found in the database.</p>
        </div>
      ) : (
        <FlavorsList flavors={uniqueFlavors} />
      )}
    </div>
  )
} 