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

type FlavorsPageProps = {
  searchParams: Promise<{ category?: string }>
}

export default async function FlavorsPage({ searchParams }: FlavorsPageProps) {
  const supabase = createClient()
  const params = await searchParams
  const initialCategory = params.category
  
  // Get all unique flavor categories from products
  const { data: categoriesData, error } = await supabase
    .from('products')
    .select('flavor_categories')
    .not('flavor_categories', 'eq', '{}')
    .not('flavor_categories', 'is', null)

  if (error) {
    console.error('Error fetching flavor categories:', error)
    return null
  }

  // Extract and flatten all categories from products
  const allCategories = categoriesData?.reduce((acc: string[], product) => {
    return acc.concat(product.flavor_categories || [])
  }, [])

  // Get unique categories and sort alphabetically
  const uniqueCategories = [...new Set(allCategories)].sort()

  return (
    <div className="space-y-6">
      <FlavorsHeader />
      
      {uniqueCategories.length === 0 ? (
        <div className="rounded-xl bg-card p-6 text-center">
          <p className="font-plus-jakarta text-muted-foreground">No flavor categories found in the database.</p>
        </div>
      ) : (
        <FlavorsList categories={uniqueCategories} initialExpandedCategory={initialCategory} />
      )}
    </div>
  )
} 