import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { QuickRating } from '@/components/products/QuickRating'
import Link from 'next/link'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'brand-slug': brandSlug, 'product-slug': productSlug } = await params
  const supabase = createClient()
  
  const { data: brand } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', brandSlug)
    .single()

  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', productSlug)
    .single()

  return {
    title: `${product?.name} by ${brand?.name} | Sparkling Authority`,
    description: product?.description || `Discover ${product?.name} by ${brand?.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
    openGraph: {
      title: `${product?.name} by ${brand?.name}`,
      description: product?.description || `Discover ${product?.name} by ${brand?.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
      type: 'website',
      url: `https://sparklingauthority.com/explore/brands/${brandSlug}/products/${productSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product?.name} by ${brand?.name}`,
      description: product?.description || `Discover ${product?.name} by ${brand?.name} on Sparkling Authority. Read reviews, ratings, and detailed information about this sparkling water product.`,
    }
  }
}

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

type Props = {
  params: Promise<{
    'brand-slug': string
    'product-slug': string
  }>
}

export default async function ProductPage({ params }: Props) {
  const { 'brand-slug': brandSlug, 'product-slug': productSlug } = await params
  const supabase = createClient()
  
  // First get the brand to ensure it exists
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, description')
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    return <div>Brand not found</div>
  }

  // Then get the product using both brand ID and product slug
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_lines (
        id,
        name,
        description
      ),
      product_containers (
        container_type,
        container_size
      ),
      brands (
        name,
        slug
      )
    `)
    .eq('brand_id', brand.id)
    .eq('slug', productSlug)
    .single()

  if (!product) {
    return <div>Product not found</div>
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

  // Fetch rating data
  const { data: ratingData } = await supabase
    .from('product_ratings')
    .select('rating')
    .eq('product_id', product.id)

  // Calculate average rating
  const ratings = ratingData?.map(r => r.rating) || []
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : undefined

  // Get user's rating if they're logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let userRating
  if (session?.user) {
    const { data: userRatingData } = await supabase
      .from('product_ratings')
      .select('rating')
      .eq('product_id', product.id)
      .eq('user_id', session.user.id)
      .single()
    
    userRating = userRatingData?.rating
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link 
                    href={`/explore/brands/${brandSlug}`}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {brand.name}
                  </Link>
                </li>
                <li>
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                </li>
              </ol>
            </nav>

            {/* Product Header */}
            <div>
              <div className="flex items-center gap-6">
                {/* Product Image Placeholder */}
                <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    by {product.brands.name}
                  </p>
                  
                  {/* Rating Section */}
                  <div className="mt-4">
                    <QuickRating
                      productId={product.id}
                      productName={product.name}
                      brandName={product.brands.name}
                      initialRating={userRating}
                      averageRating={averageRating}
                      totalRatings={ratings.length}
                    />
                  </div>
                </div>
              </div>

              {/* Product Quick Stats */}
              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Carbonation</dt>
                  <dd className="mt-1 text-lg font-medium text-foreground">
                    Level {product.carbonation_level}
                  </dd>
                </div>
                <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Calories</dt>
                  <dd className="mt-1 text-lg font-medium text-foreground">
                    {nutrition.calories}
                  </dd>
                </div>
                <div className="col-span-2 rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
                  <dt className="text-sm font-medium text-muted-foreground">Available Containers</dt>
                  <dd className="mt-1 space-y-1">
                    {(Object.entries(containersByType) as [string, string[]][]).map(([type, sizes]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {type}:
                        </span>
                        <span className="text-sm text-muted-foreground">
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
              <h2 className="text-lg font-medium text-foreground">Flavors</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.flavor.map((flavor: string) => (
                  <span
                    key={flavor}
                    className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground ring-1 ring-inset ring-border"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
              <h2 className="text-lg font-medium text-foreground">Nutrition Facts</h2>
              <div className="mt-4 rounded-lg bg-card shadow-sm ring-1 ring-border">
                <dl className="divide-y divide-border">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Serving Size</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.serving_size}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Calories</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.calories}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Fat</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_fat}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Sodium</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.sodium}mg
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Carbohydrates</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_carbohydrates}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Total Sugars</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.total_sugars}g
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Protein</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {nutrition.protein}g
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-medium text-foreground">Ingredients</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {nutrition.ingredients}
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-card rounded-lg shadow-sm ring-1 ring-border overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-foreground">Product Details</h3>
              </div>
              <div className="border-t border-border">
                <dl>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {product.brands.name}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                      {product.description}
                    </dd>
                  </div>
                  {/* Add more product details as needed */}
                </dl>
              </div>
            </div>

            {/* Placeholder for future sections */}
            <div className="rounded-lg bg-muted px-4 py-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-foreground">Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">
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