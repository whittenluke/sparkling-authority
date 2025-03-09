import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductList } from './components/ProductList'

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = createClient()
  
  // Get all products with their brands
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brands (
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Directory</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Browse our complete collection of sparkling waters.
              </p>
            </div>

            <ProductList products={products} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 