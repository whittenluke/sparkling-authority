import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

type BrandSlug = {
  slug: string
}

type ProductWithBrand = {
  slug: string
  updated_at: string | null
  brand_id: string
  brands: BrandSlug | BrandSlug[] | null
}

type ProductLineWithBrand = {
  id: string
  updated_at: string | null
  brand_id: string
  brands: BrandSlug | BrandSlug[] | null
}

function getBrandSlug(brands: BrandSlug | BrandSlug[] | null): string | null {
  if (!brands) return null
  if (Array.isArray(brands)) {
    return brands.length > 0 ? brands[0].slug : null
  }
  return brands.slug
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sparklingauthority.com'
  const supabase = createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore/brands`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore/flavors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Learn pages
    {
      url: `${baseUrl}/learn/buying`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/carbonation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/health`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/how-to-make-sparkling-water`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Ratings pages
    {
      url: `${baseUrl}/ratings/best-overall`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ratings/strongest-carbonation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Community pages
    {
      url: `${baseUrl}/community/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community/forum`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Fetch all brands
  const { data: brands } = await supabase
    .from('brands')
    .select('slug, updated_at')
    .order('name')

  const brandPages: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${baseUrl}/explore/brands/${brand.slug}`,
    lastModified: brand.updated_at ? new Date(brand.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all products with their brand slugs
  const { data: products } = await supabase
    .from('products')
    .select(`
      slug,
      updated_at,
      brand_id,
      brands (
        slug
      )
    `)
    .order('name')

  const productPages: MetadataRoute.Sitemap = (products as ProductWithBrand[] || [])
    .flatMap((product) => {
      const brandSlug = getBrandSlug(product.brands)
      if (!brandSlug) return []
      return [{
        url: `${baseUrl}/explore/brands/${brandSlug}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }]
    })

  // Fetch all product lines with their brand slugs
  const { data: productLines } = await supabase
    .from('product_lines')
    .select(`
      id,
      updated_at,
      brand_id,
      brands (
        slug
      )
    `)

  const productLinePages: MetadataRoute.Sitemap = (productLines as ProductLineWithBrand[] || [])
    .flatMap((line) => {
      const brandSlug = getBrandSlug(line.brands)
      if (!brandSlug) return []
      return [{
        url: `${baseUrl}/explore/brands/${brandSlug}/line/${line.id}`,
        lastModified: line.updated_at ? new Date(line.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }]
    })

  return [...staticPages, ...brandPages, ...productPages, ...productLinePages]
}

