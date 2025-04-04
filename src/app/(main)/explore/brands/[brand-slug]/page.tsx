import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductsSection } from './components/ProductsSection'
import { Metadata } from 'next'

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