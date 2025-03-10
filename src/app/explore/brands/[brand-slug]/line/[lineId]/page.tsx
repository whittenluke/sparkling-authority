import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Product = {
  id: string
  name: string
  flavor: string[]
  carbonation_level: number
  nutrition_info: {
    calories?: number
    ingredients?: string[]
    serving_size?: string
  }
  containers: {
    type: string
    size: string
  }[]
}

type Props = {
  params: {
    'brand-slug': string
    lineId: string
  }
}

export default async function ProductLinePage({ params }: Props) {
  const { 'brand-slug': brandSlug, lineId } = params
  const supabase = createClient()
  
  // Get brand info
  const { data: brand } = await supabase
    .from('brands')
    .select(`
      id,
      name,
      description,
      founded_year,
      country_of_origin
    `)
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    notFound()
  }

  // Get line info and its products
  const { data: line } = await supabase
    .from('product_lines')
    .select(`
      id,
      name,
      description,
      is_default,
      products (
        id,
        name,
        flavor,
        carbonation_level,
        nutrition_info,
        containers
      )
    `)
    .eq('brand_id', brand.id)
    .eq('id', lineId)
    .single()

  if (!line) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {line.is_default ? brand.name : `${brand.name} ${line.name}`}
                  </h1>
                  {line.description && (
                    <p className="mt-2 text-lg text-gray-600">{line.description}</p>
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
                    {line.products?.length || 0}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Products Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <div className="mt-6 space-y-4">
                {line.products?.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/explore/products/${product.id}`}
                    className="group block rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-200"
                  >
                    <div className="flex items-start gap-5">
                      {/* Product Image Placeholder */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 group-hover:bg-gray-100">
                        <div className="flex h-full w-full items-center justify-center text-xl text-gray-400">
                          {product.name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {product.name}
                        </h3>
                        {product.flavor && product.flavor.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {product.flavor.map((flavor: string) => (
                              <span 
                                key={flavor} 
                                className="inline-block rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                              >
                                {flavor}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 