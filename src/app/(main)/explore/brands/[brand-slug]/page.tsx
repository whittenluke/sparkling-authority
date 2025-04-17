import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductsSection } from './components/ProductsSection'
import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    'brand-slug': string
  }>
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
        flavor,
        product_line_id,
        slug
      )
    `)
    .eq('slug', brandSlug)
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
      <div>
        <div className="flex items-center gap-6">
          {/* Brand Logo/Letter */}
          <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center text-foreground text-3xl font-medium">
            {brand.name.charAt(0)}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{brand.name}</h1>
            {brand.description && (
              <p className="mt-2 text-lg text-muted-foreground">{brand.description}</p>
            )}
          </div>
        </div>

        {/* Brand Quick Stats */}
        <dl className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
            <dt className="text-sm font-medium text-muted-foreground">Founded</dt>
            <dd className="mt-1 text-lg font-medium text-foreground">
              {brand.founded_year || 'Unknown'}
            </dd>
          </div>
          <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
            <dt className="text-sm font-medium text-muted-foreground">Country</dt>
            <dd className="mt-1 text-lg font-medium text-foreground">
              {brand.country_of_origin || 'Unknown'}
            </dd>
          </div>
          <div className="rounded-lg bg-card px-4 py-3 shadow-sm ring-1 ring-border">
            <dt className="text-sm font-medium text-muted-foreground">Products</dt>
            <dd className="mt-1 text-lg font-medium text-foreground">
              {brand.products?.length || 0}
            </dd>
          </div>
        </dl>
      </div>

      {/* Products Section with Line Filter */}
      <ProductsSection
        products={brand.products || []}
        productLines={productLines}
        brandSlug={brandSlug}
      />
    </div>
  )
}