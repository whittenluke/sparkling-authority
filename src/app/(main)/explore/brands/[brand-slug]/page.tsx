import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductsSection } from './components/ProductsSection'
import { BrandHeader } from './components/BrandHeader'
import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    'brand-slug': string
  }>
}

type Brand = {
  id: string
  name: string
  description: string | null
  founded_year: number | null
  country_of_origin: string | null
  product_lines: ProductLine[]
  products: BrandProduct[]
}

type ProductLine = {
  id: string
  name: string
  description: string | null
  is_default: boolean
}

type BrandProduct = {
  id: string
  name: string
  flavor_tags: string[]
  product_line_id: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
  reviews: {
    overall_rating: number
  }[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'brand-slug': brandSlug } = await params
  const supabase = createClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('name, description')
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    return {
      title: 'Brand Not Found | Sparkling Authority',
      description: 'The requested brand could not be found.'
    }
  }

  return {
    title: `${brand.name} | Sparkling Authority`,
    description: brand.description || `Discover ${brand.name}'s sparkling water products on Sparkling Authority. Browse their full range of flavors and varieties.`,
    openGraph: {
      title: brand.name,
      description: brand.description || `Discover ${brand.name}'s sparkling water products on Sparkling Authority. Browse their full range of flavors and varieties.`,
      type: 'website',
      url: `https://sparklingauthority.com/explore/brands/${brandSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: brand.name,
      description: brand.description || `Discover ${brand.name}'s sparkling water products on Sparkling Authority. Browse their full range of flavors and varieties.`,
    }
  }
}

export default async function BrandPage({ params }: Props) {
  const { 'brand-slug': brandSlug } = await params
  const supabase = createClient()

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
        flavor_tags,
        product_line_id,
        slug,
        brand:brand_id (
          id,
          name,
          slug
        ),
        reviews (
          overall_rating
        )
      )
    `)
    .eq('slug', brandSlug)
    .single() as { data: Brand | null }

  if (!brand) {
    notFound()
  }

  // Get mean rating across all products for Bayesian average
  const { data: allProducts } = await supabase
    .from('products')
    .select(`
      reviews (
        overall_rating
      )
    `)

  // Calculate the mean rating across ALL products
  const allRatings = allProducts?.flatMap(p => p.reviews?.map(r => r.overall_rating) || []) || []
  const meanRating = allRatings.length > 0 
    ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length 
    : 3.5 // Fallback to 3.5 if no ratings exist

  // Calculate average ratings for products
  const productsWithRatings = brand.products.map((product: BrandProduct) => {
    const ratings = product.reviews?.map(r => r.overall_rating) || []
    const ratingCount = ratings.length
    
    // Calculate Bayesian average using global mean
    const C = 10 // confidence factor
    const sumOfRatings = ratings.reduce((a: number, b: number) => a + b, 0)
    const bayesianAverage = ratingCount > 0
      ? (C * meanRating + sumOfRatings) / (C + ratingCount)
      : undefined // Use undefined for no ratings to match product page behavior
    
    return {
      ...product,
      averageRating: bayesianAverage,
      ratingCount: ratingCount,
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug
      }
    }
  })

  // Sort product lines to ensure default line comes first
  const productLines = (brand.product_lines || []).sort((a: ProductLine, b: ProductLine) => {
    if (a.is_default) return -1
    if (b.is_default) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
                  <span className="text-sm font-medium text-foreground">{brand.name}</span>
                </li>
              </ol>
            </nav>

            {/* Brand Header */}
            <BrandHeader brand={brand} productCount={productsWithRatings.length} />

            {/* Products Section with Line Filter */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Products</h2>
              </div>
              <ProductsSection
                products={productsWithRatings}
                productLines={productLines}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}