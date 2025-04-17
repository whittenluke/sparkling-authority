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
      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Latest Reviews Section */}
      <div className="mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Latest Reviews</h2>
          <Link href="/reviews" className="text-sm font-medium text-primary hover:text-primary/90">
            View all
          </Link>
        </div>

        {/* Featured Review Card */}
        <div className="mt-6">
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-muted"></div>
              <div>
                <h3 className="font-semibold text-foreground">Brand Name</h3>
                <div className="mt-1 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 