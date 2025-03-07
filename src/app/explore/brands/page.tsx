import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BrandsGrid } from './components/BrandsGrid'
import { BrandsHeader } from './components/BrandsHeader'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get brands with their product lines
  const { data: brands } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      product_lines (
        id,
        name,
        description,
        is_default,
        products:products(count)
      )
    `)
    .order('name')

  // Transform data to show both regular brands and product lines as separate entries
  const brandEntries = (brands || []).flatMap(brand => {
    const productLines = brand.product_lines || []
    
    // If brand has no product lines, show it as a regular brand
    if (productLines.length === 0) {
      return [{
        id: brand.id,
        name: brand.name,
        description: brand.description,
        productCount: 0,
        isProductLine: false
      }]
    }
    
    // If brand has product lines, show each as a separate entry
    return productLines.map(line => ({
      id: brand.id,
      name: line.is_default ? brand.name : `${brand.name} ${line.name}`,
      description: line.description || brand.description,
      productCount: line.products.count,
      isProductLine: true,
      productLineId: line.id
    }))
  })

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