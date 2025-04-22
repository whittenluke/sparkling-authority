import { Metadata } from 'next'
import { SubmitReviewForm } from './SubmitReviewForm'

export const dynamic = 'force-dynamic'

// SEO metadata configuration
export const metadata: Metadata = {
  title: 'Submit a Sparkling Water Review | Sparkling Authority',
  description: 'Share your sparkling water experience with our community. Rate and review your favorite (or not so favorite) sparkling water products with our comprehensive review system.',
  openGraph: {
    title: 'Submit a Sparkling Water Review | Sparkling Authority',
    description: 'Share your sparkling water experience with our community. Rate and review your favorite (or not so favorite) sparkling water products with our comprehensive review system.',
    type: 'website',
    url: 'https://sparklingauthority.com/community/reviews/submit',
    images: [
      {
        url: '/images/community/reviews/submit-review-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Submit a sparkling water review on Sparkling Authority',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit a Sparkling Water Review | Sparkling Authority',
    description: 'Share your sparkling water experience with our community. Rate and review your favorite (or not so favorite) sparkling water products with our comprehensive review system.',
    images: ['/images/community/reviews/submit-review-hero.webp'],
  }
}

// JSON-LD Schema markup
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Submit a Sparkling Water Review',
  description: 'Share your sparkling water experience with our community. Rate and review your favorite (or not so favorite) sparkling water products.',
  publisher: {
    '@type': 'Organization',
    name: 'Sparkling Authority',
    url: 'https://sparklingauthority.com'
  },
  mainEntity: {
    '@type': 'ReviewAction',
    object: {
      '@type': 'Product',
      category: 'Sparkling Water'
    }
  }
}

export default function SubmitReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit a Review</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Share your thoughts about your favorite sparkling water.
          </p>
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium text-primary">
              Coming Soon! Review submission will be available shortly.
            </p>
          </div>
        </div>
        
        <SubmitReviewForm />
      </div>
    </>
  )
} 