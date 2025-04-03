import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Featured Sparkling Water Reviews | Sparkling Authority',
  description: 'Discover top-rated sparkling water reviews from our community. Read detailed experiences and insights from fellow sparkling water enthusiasts.',
  openGraph: {
    title: 'Featured Sparkling Water Reviews | Sparkling Authority',
    description: 'Discover top-rated sparkling water reviews from our community. Read detailed experiences and insights from fellow sparkling water enthusiasts.',
    type: 'website',
    url: 'https://sparklingauthority.com/community/reviews/featured',
    images: [
      {
        url: '/images/community/reviews/featured-reviews-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Featured sparkling water reviews on Sparkling Authority',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Featured Sparkling Water Reviews | Sparkling Authority',
    description: 'Discover top-rated sparkling water reviews from our community. Read detailed experiences and insights from fellow sparkling water enthusiasts.',
    images: ['/images/community/reviews/featured-reviews-hero.webp'],
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Featured Sparkling Water Reviews',
  description: 'A curated collection of top-rated sparkling water reviews from our community.',
  publisher: {
    '@type': 'Organization',
    name: 'Sparkling Authority',
    url: 'https://sparklingauthority.com'
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [] // Will be populated with actual reviews
  }
}

export default function FeaturedReviewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Featured Reviews</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover what our community thinks about their favorite sparkling waters.
          </p>
        </div>
        
        {/* Reviews will be loaded here */}
      </div>
    </>
  )
} 