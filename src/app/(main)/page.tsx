import Link from 'next/link'
import { Crown, Cherry, Grid3x3, Sparkles, PartyPopper, MapPin, Star, Sparkles as SparklesIcon } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="max-w-3xl space-y-4">
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary sm:text-6xl">
          Your Definitive Guide to Sparkling Water
        </h1>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          Expert reviews, flavor insights, and personalized recommendations for sparkling water enthusiasts
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/explore/products" 
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <SparklesIcon className="mr-2 h-5 w-5" />
          Find Your Perfect Fizz
        </Link>
        <Link 
          href="/ratings/best-overall" 
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-6 py-3 text-base font-semibold text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          <Star className="mr-2 h-5 w-5" />
          Browse Top-Rated Waters
        </Link>
      </div>

      {/* Main Navigation Cards */}
      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Mission Statement */}
      <div className="mt-24 bg-primary/5 rounded-2xl p-8">
        <h2 className="font-clash-display text-2xl font-medium text-primary mb-4">Why Sparkling Authority?</h2>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80">
          At Sparkling Authority, we&apos;re dedicated to exploring the diverse world of sparkling water. Through testing and detailed reviews, we provide insights into flavor profiles, carbonation, and mineral composition across brands and products.
        </p>
        <p className="font-plus-jakarta text-lg leading-8 text-primary/80 mt-4">
          Whether you&apos;re discovering new options, comparing popular favorites, or deepening your appreciation for subtle differences, our platform offers the expertise and community to enhance your sparkling water experience.
        </p>
      </div>
    </>
  )
} 