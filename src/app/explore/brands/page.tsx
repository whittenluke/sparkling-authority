import { createClient } from '@/lib/supabase/server'
import { BrandsGrid } from './components/BrandsGrid'
import { BrandsHeader } from './components/BrandsHeader'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

type Brand = {
  id: string
  name: string
  description: string | null
  products: { count: number }[]
  slug: string
}

export default async function BrandsPage() {
  const supabase = createClient()
  
  // Get brands with their total product count
  const { data: brands } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      slug,
      products (count)
    `)
    .order('name')

  // Transform data to show brands with their total product counts
  const brandEntries = (brands || []).map((brand: Brand) => ({
    id: brand.id,
    name: brand.name,
    description: brand.description || undefined,
    productCount: brand.products?.[0]?.count || 0,
    isProductLine: false,
    slug: brand.slug
  }))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <BrandsHeader />
            <BrandsGrid brands={brandEntries} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}