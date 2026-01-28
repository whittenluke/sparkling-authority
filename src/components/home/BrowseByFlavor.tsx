import Link from 'next/link'
import { FlavorIcon } from './FlavorIcon'

type FlavorCategory = {
  name: string
  slug: string
}

const flavorCategories = [
  { name: 'Berry', slug: 'berry' },
  { name: 'Citrus', slug: 'citrus' },
  { name: 'Cream', slug: 'cream' },
  { name: 'Floral', slug: 'floral' },
  { name: 'Melon', slug: 'melon' },
  { name: 'Soda', slug: 'soda' },
  { name: 'Tropical', slug: 'tropical' },
  { name: 'Unflavored', slug: 'unflavored' },
]

export function BrowseByFlavor() {
  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-clash-display text-2xl font-medium text-primary sm:text-3xl">
          Browse by Flavor
        </h2>
        <Link 
          href="/explore/flavors"
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          View All Flavors
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {flavorCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/explore/flavors?category=${category.slug}`}
            className="group relative flex flex-col items-center justify-center rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary transition-all text-center"
          >
            <FlavorIcon category={category.slug} />
            <h3 className="text-base font-clash-display font-medium text-primary mt-4">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )
}

