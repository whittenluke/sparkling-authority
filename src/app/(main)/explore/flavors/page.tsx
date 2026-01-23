import { FlavorsList } from './components/FlavorsList'
import { FlavorsHeader } from './components/FlavorsHeader'
import { Metadata } from 'next'
import categoryTagMap from '@/categoryTagMap.json'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Flavors | Sparkling Authority',
    description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
    openGraph: {
      title: 'Flavors | Sparkling Authority',
      description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/flavors',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Flavors | Sparkling Authority',
      description: 'Explore sparkling waters by their unique flavors. From classic citrus to exotic fruit blends, find your perfect flavor match.',
    }
  }
}

type FlavorsPageProps = {
  searchParams: Promise<{ category?: string }>
}

export default async function FlavorsPage({ searchParams }: FlavorsPageProps) {
  const params = await searchParams
  const initialCategory = params.category

  // Get categories from categoryTagMap.json instead of database
  const categories = Object.keys(categoryTagMap).sort()

  return (
    <div className="space-y-6">
      <FlavorsHeader />

      <FlavorsList categories={categories} initialExpandedCategory={initialCategory} />
    </div>
  )
}
