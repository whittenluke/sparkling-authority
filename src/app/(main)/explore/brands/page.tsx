import { createClient } from '@/lib/supabase/server'
import { BrandsGrid } from './components/BrandsGrid'
import { BrandsHeader } from './components/BrandsHeader'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Brand = {
  id: string
  name: string
  description: string | null
  brand_logo_light: string | null
  brand_logo_dark: string | null
  products: { count: number }[]
  slug: string
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Brands | Sparkling Authority',
    description: 'Discover and explore the world\'s finest sparkling water brands. Browse our comprehensive collection of brands and their products.',
    openGraph: {
      title: 'Brands | Sparkling Authority',
      description: 'Discover and explore the world\'s finest sparkling water brands. Browse our comprehensive collection of brands and their products.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/brands',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Brands | Sparkling Authority',
      description: 'Discover and explore the world\'s finest sparkling water brands. Browse our comprehensive collection of brands and their products.',
    }
  }
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
      brand_logo_light,
      brand_logo_dark,
      products (count)
    `)
    .order('name')

  // Transform data to show brands with their total product counts
  const brandEntries = (brands || []).map((brand: Brand) => ({
    id: brand.id,
    name: brand.name,
    description: brand.description || undefined,
    brand_logo_light: brand.brand_logo_light || undefined,
    brand_logo_dark: brand.brand_logo_dark || undefined,
    productCount: brand.products?.[0]?.count || 0,
    isProductLine: false,
    slug: brand.slug
  }))

  return (
    <div className="space-y-8">
      <BrandsHeader />
      <BrandsGrid brands={brandEntries} />
    </div>
  )
}