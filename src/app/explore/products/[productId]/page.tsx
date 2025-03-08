import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

type NutritionInfo = {
  calories: number
  total_fat: number
  sodium: number
  total_carbohydrates: number
  total_sugars: number
  protein: number
  serving_size: string
  ingredients: string
}

type ProductContainer = {
  container_type: string
  container_size: string
}

type PageProps = {
  params: {
    productId: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      brands (
        id,
        name,
        description
      ),
      product_lines (
        id,
        name,
        description
      ),
      product_containers (
        container_type,
        container_size
      )
    `)
    .eq('id', params.productId)
    .single()

  if (!product) {
    notFound()
  }

  const nutrition: NutritionInfo = product.nutrition_info

  // Group containers by type
  const containersByType = product.product_containers.reduce((acc: { [key: string]: string[] }, container: ProductContainer) => {
    if (!acc[container.container_type]) {
      acc[container.container_type] = [];
    }
    acc[container.container_type].push(container.container_size);
    return acc;
  }, {} as { [key: string]: string[] });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link 
                    href="/explore/brands"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link 
                    href={`/explore/brands/${product.brands.id}`}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {product.brands.name}
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </li>
              </ol>
            </nav>

            {/* Product Header */}
            <div>
              <div className="flex items-center gap-6">
                {/* Product Image Placeholder */}
                <div className="h-32 w-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                  <p className="mt-2 text-lg text-gray-600">{product.description}</p>
                  {product.product_lines && (
                    <p className="mt-1 text-sm text-gray-500">
                      {product.product_lines.name} Line
                    </p>
                  )}
                </div>
              </div>

              {/* Updated Product Quick Stats */}
              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Carbonation</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    Level {product.carbonation_level}
                  </dd>
                </div>
                <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Calories</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">
                    {nutrition.calories}
                  </dd>
                </div>
                <div className="col-span-2 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Available Containers</dt>
                  <dd className="mt-1 space-y-1">
                    {(Object.entries(containersByType) as [string, string[]][]).map(([type, sizes]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {type}:
                        </span>
                        <span className="text-sm text-gray-600">
                          {sizes.sort().join(', ')}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Flavor Tags */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">Flavors</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.flavor.map((flavor: string) => (
                  <span
                    key={flavor}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">Nutrition Facts</h2>
              <div className="mt-4 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Serving Size</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.serving_size}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Calories</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.calories}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Total Fat</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.total_fat}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sodium</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.sodium}mg
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Total Carbohydrates</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.total_carbohydrates}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Total Sugars</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.total_sugars}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Protein</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {nutrition.protein}g
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">Ingredients</h2>
              <p className="mt-2 text-sm text-gray-600">
                {nutrition.ingredients}
              </p>
            </div>

            {/* Placeholder for future sections */}
            <div className="rounded-lg bg-gray-50 px-4 py-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900">Coming Soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Reviews, ratings, and price tracking features are on the way!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 