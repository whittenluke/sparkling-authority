import Link from 'next/link'
import Image from 'next/image'
import berryIcon from '@/components/icons/berry.svg'
import citrusIcon from '@/components/icons/citrus.svg'
import creamIcon from '@/components/icons/cream.svg'
import floralIcon from '@/components/icons/floral.svg'
import melonIcon from '@/components/icons/melon.svg'
import sodaIcon from '@/components/icons/soda.svg'
import tropicalIcon from '@/components/icons/tropical.svg'
import unflavoredIcon from '@/components/icons/unflavored.svg'

type FlavorCategory = {
  name: string
  slug: string
  iconSrc: string
}

const flavorCategories: FlavorCategory[] = [
  { name: 'Berry', slug: 'berry', iconSrc: berryIcon },
  { name: 'Citrus', slug: 'citrus', iconSrc: citrusIcon },
  { name: 'Cream', slug: 'cream', iconSrc: creamIcon },
  { name: 'Floral', slug: 'floral', iconSrc: floralIcon },
  { name: 'Melon', slug: 'melon', iconSrc: melonIcon },
  { name: 'Soda', slug: 'soda', iconSrc: sodaIcon },
  { name: 'Tropical', slug: 'tropical', iconSrc: tropicalIcon },
  { name: 'Unflavored', slug: 'unflavored', iconSrc: unflavoredIcon },
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
              <Image
                src={category.iconSrc}
                alt={`${category.name} icon`}
                width={28}
                height={28}
                className="h-7 w-7"
              />
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

