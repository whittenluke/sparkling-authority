import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Releases | Sparkling Authority',
    description: 'Stay up to date with the latest sparkling water products and brands. Discover new flavors, brands, and innovations in the sparkling water world.',
    openGraph: {
      title: 'New Releases | Sparkling Authority',
      description: 'Stay up to date with the latest sparkling water products and brands. Discover new flavors, brands, and innovations in the sparkling water world.',
      type: 'website',
      url: 'https://sparklingauthority.com/explore/new-releases',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'New Releases | Sparkling Authority',
      description: 'Stay up to date with the latest sparkling water products and brands. Discover new flavors, brands, and innovations in the sparkling water world.',
    }
  }
}

export default async function NewReleasesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">New Releases</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          Stay up to date with the latest sparkling water products and brands.
        </p>
      </div>

      {/* New Products Section */}
      <div>
        <h2 className="font-clash-display text-2xl font-medium text-primary">New Products</h2>
        <div className="mt-4 rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
          <p className="font-plus-jakarta text-muted-foreground">
            New product releases will be shown here soon.
          </p>
        </div>
      </div>

      {/* New Brands Section */}
      <div>
        <h2 className="font-clash-display text-2xl font-medium text-primary">New Brands</h2>
        <div className="mt-4 rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
          <p className="font-plus-jakarta text-muted-foreground">
            New brand launches will be shown here soon.
          </p>
        </div>
      </div>
    </div>
  )
} 