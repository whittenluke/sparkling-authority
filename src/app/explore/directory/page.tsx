import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductList } from './components/ProductList'
import { SearchSection } from './components/SearchSection'

type Product = {
  id: string
  name: string
  brand: {
    id: string
    name: string
  }
}

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = createClient()
  
  // Get all products with their brands
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brand:brand_id (
        id,
        name
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Error Loading Products</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Sorry, we encountered an error while loading the product directory. Please try again later.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Directory</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                No products found. Check back soon as we add more products to our collection.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Transform products to match the expected type
  const transformedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    brand: Array.isArray(product.brand) ? product.brand[0] : product.brand
  }))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </main>
      <Footer />
    </div>
  )
} 