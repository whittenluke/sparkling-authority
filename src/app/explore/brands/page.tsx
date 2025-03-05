import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BrandsGrid } from './components/BrandsGrid'
import { BrandsHeader } from './components/BrandsHeader'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: brands } = await supabase
    .from('brands')
    .select(`
      *,
      products:products(count)
    `)
    .order('name')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <main className="flex-grow py-8">
          <div className="space-y-8">
            <BrandsHeader />
            <BrandsGrid brands={brands || []} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
} 