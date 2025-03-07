import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BrandsGrid } from './components/BrandsGrid'
import { BrandsHeader } from './components/BrandsHeader'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get brands with their total product count
  const { data: brands } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      products (count)
    `)
    .order('name')

  // Transform data to show brands with their total product counts
  const brandEntries = (brands || []).map(brand => ({
    id: brand.id,
    name: brand.name,
    description: brand.description,
    productCount: brand.products?.[0]?.count || 0,
    isProductLine: false
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <main className="flex-grow py-8">
          <div className="space-y-8">
            <BrandsHeader />
            <BrandsGrid brands={brandEntries} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
} 