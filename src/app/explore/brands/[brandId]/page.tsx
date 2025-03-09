import { createServerComponentClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductsSection } from './components/ProductsSection'

export const dynamic = 'force-dynamic'

export default async function BrandPage({
  params,
}: {
  params: { brandId: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: brand } = await supabase
    .from('brands')
    .select(`
      *,
      product_lines (
        id,
        name,
        description,
        is_default
      ),
      products (
        id,
        name,
        flavor,
        product_line_id
      )
    `)
    .eq('id', params.brandId)
    .single()

  if (!brand) {
    notFound()
  }

  // Sort product lines to ensure default line comes first
  const productLines = (brand.product_lines || []).sort((a: { is_default: boolean, name: string }, b: { is_default: boolean, name: string }) => {
    if (a.is_default) return -1
    if (b.is_default) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Brand Header */}
            <div>
              <div className="flex items-center gap-6">
                {/* Brand Logo/Letter */}
                <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 text-3xl font-medium">
                  {brand.name.charAt(0)}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">{brand.name}</h1>
                  {brand.description && (
                    <p className="mt-2 text-lg text-gray-600">{brand.description}</p>
                  )}
                </div>
              </div>

              {/* Brand Quick Stats */}
              <dl className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Founded</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {brand.founded_year || 'Unknown'}
                  </dd>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {brand.country_of_origin || 'Unknown'}
                  </dd>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Products</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {brand.products?.length || 0}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Products Section with Line Filter */}
            <ProductsSection 
              products={brand.products || []} 
              productLines={productLines} 
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 