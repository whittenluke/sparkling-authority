import { createClient } from '@/lib/supabase/server'
import { FlavorsList } from './components/FlavorsList'

export const dynamic = 'force-dynamic'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse by Flavor</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore sparkling waters by their unique flavors and find your perfect match.
        </p>
      </div>

      {uniqueFlavors.length === 0 ? (
        <div className="rounded-xl bg-card p-6 text-center">
          <p className="text-muted-foreground">No flavors found in the database.</p>
        </div>
      ) : (
        <FlavorsList flavors={uniqueFlavors} />
      )}
    </div>
  )
} 