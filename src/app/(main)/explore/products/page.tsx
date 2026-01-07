import { ProductsContent } from './components/ProductsContent'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Products | Sparkling Authority',
    description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
    openGraph: {
      title: 'Products | Sparkling Authority',
      description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/products',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Products | Sparkling Authority',
      description: 'Browse our comprehensive collection of sparkling water products. Search by product name, brand, flavor, or carbonation level.',
    }
  }
}

export default async function ProductsPage() {
  return <ProductsContent />
}
