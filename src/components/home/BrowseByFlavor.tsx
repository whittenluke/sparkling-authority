import Link from 'next/link'
import { Cherry, Citrus, Milk, Flower, Apple, Coffee, Palmtree, Droplet } from 'lucide-react'

type FlavorCategory = {
  name: string
  slug: string
  icon: React.ReactNode
}

const flavorCategories: FlavorCategory[] = [
  { name: 'Berry', slug: 'berry', icon: <Cherry className="h-7 w-7" /> },
  { name: 'Citrus', slug: 'citrus', icon: <Citrus className="h-7 w-7" /> },
  { name: 'Cream', slug: 'cream', icon: <Milk className="h-7 w-7" /> },
  { name: 'Floral', slug: 'floral', icon: <Flower className="h-7 w-7" /> },
  { name: 'Melon', slug: 'melon', icon: <Apple className="h-7 w-7" /> },
  { name: 'Soda', slug: 'soda', icon: <Coffee className="h-7 w-7" /> },
  { name: 'Tropical', slug: 'tropical', icon: <Palmtree className="h-7 w-7" /> },
  { name: 'Unflavored', slug: 'unflavored', icon: <Droplet className="h-7 w-7" /> },
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
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              {category.icon}
            </div>
            <h3 className="text-base font-clash-display font-medium text-primary">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )
}

