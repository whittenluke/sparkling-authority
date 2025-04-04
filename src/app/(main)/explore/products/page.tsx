import { createClient } from '@/lib/supabase/server'
import { ProductList } from './components/ProductList'
import { SearchSection } from './components/SearchSection'
import { Metadata } from 'next'

type Product = {
  id: string
  name: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

export const dynamic = 'force-dynamic'

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

export default async function DirectoryPage() {
  const supabase = createClient()
  
  // Get all products with their brands
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      brand:brand_id (
        id,
        name,
        slug
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Error Loading Products</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sorry, we encountered an error while loading the product directory. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Directory</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            No products found. Check back soon as we add more products to our collection.
          </p>
        </div>
      </div>
    )
  }

  // Transform products to match the expected type
  const transformedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: Array.isArray(product.brand) ? product.brand[0] : product.brand
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our growing list of sparkling waters.
        </p>
      </div>

      <SearchSection />

      <ProductList products={transformedProducts} />
    </div>
  )
} 