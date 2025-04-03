import Link from 'next/link'
import { Search } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Your Guide to Sparkling Water
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Expert reviews and insights for finding your perfect beverage.
        </p>
      </div>

      {/* Search Section */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Try 'mineral water with high carbonation' or 'citrus flavored'"
            className="block w-full rounded-lg border border-input bg-background py-4 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Popular Tags */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Popular:</span>
          <div className="flex flex-wrap gap-2">
            <Link href="/explore/brands" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80">
              Mineral
            </Link>
            <Link href="/explore/carbonation" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80">
              High Carbonation
            </Link>
            <Link href="/explore/flavors" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80">
              Citrus
            </Link>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/explore/brands" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Mineral Water</h3>
          <p className="mt-2 text-sm text-muted-foreground">Natural springs and mineral content</p>
        </Link>

        <Link href="/explore/carbonation" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Carbonation Levels</h3>
          <p className="mt-2 text-sm text-muted-foreground">From subtle to extra sparkling</p>
        </Link>

        <Link href="/explore/flavors" className="group relative block rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Flavored Waters</h3>
          <p className="mt-2 text-sm text-muted-foreground">Natural and infused varieties</p>
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

      {/* Featured Guide */}
      <div className="mt-12">
        <Link
          href="/guides/mineral-content"
          className="relative block overflow-hidden rounded-2xl bg-primary px-6 py-8 shadow-md hover:bg-primary/90"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-primary-foreground">The Ultimate Guide to Mineral Content</h3>
            <p className="mt-2 text-primary-foreground/80">
              Learn how mineral content affects taste, health benefits, and overall quality of sparkling water.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-primary/80"></div>
        </Link>
      </div>
    </>
  )
} 