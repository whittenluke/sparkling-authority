import Link from 'next/link'
import { Crown, Cherry, Grid3x3, Sparkles, PartyPopper, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary sm:text-6xl">
          Your Guide to Sparkling Water
        </h1>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          Find your perfect sparkling beverage
        </p>
      </div>

      {/* Main Navigation Cards */}
      <div className="mt-20 mb-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/explore/brands" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Crown className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Brands</h3>
        </Link>

        <Link href="/explore/flavors" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Cherry className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Flavors</h3>
        </Link>

        <Link href="/explore/products" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Grid3x3 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Products</h3>
        </Link>

        <Link href="/explore/carbonation" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore Carbonation</h3>
        </Link>

        <Link href="/explore/new-releases" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Explore New Releases</h3>
        </Link>

        <Link href="/explore/regional" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-clash-display font-medium text-primary">Regional Favorites</h3>
        </Link>
      </div>
    </>
  )
} 