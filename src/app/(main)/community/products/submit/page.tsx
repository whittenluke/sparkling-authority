import { Metadata } from 'next'
import { SubmitProductForm } from './SubmitProductForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Submit a Product | Sparkling Authority',
  description: 'Help us expand our sparkling water database by submitting a new product. Share detailed information about sparkling water products to help our community discover new options.',
  openGraph: {
    title: 'Submit a Product | Sparkling Authority',
    description: 'Help us expand our sparkling water database by submitting a new product. Share detailed information about sparkling water products to help our community discover new options.',
    type: 'website',
    url: 'https://sparklingauthority.com/community/products/submit',
    images: [
      {
        url: '/images/community/products/submit-product-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Submit a sparkling water product to Sparkling Authority',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit a Product | Sparkling Authority',
    description: 'Help us expand our sparkling water database by submitting a new product. Share detailed information about sparkling water products to help our community discover new options.',
    images: ['/images/community/products/submit-product-hero.webp'],
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Submit a Sparkling Water Product',
  description: 'Help us expand our sparkling water database by submitting new products.',
  publisher: {
    '@type': 'Organization',
    name: 'Sparkling Authority',
    url: 'https://sparklingauthority.com'
  },
  mainEntity: {
    '@type': 'CreateAction',
    object: {
      '@type': 'Product',
      category: 'Sparkling Water'
    }
  }
}

export default function SubmitProductPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit a Product</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Help us grow our database by submitting a sparkling water product.
          </p>
        </div>
        
        <SubmitProductForm />
      </div>
    </>
  )
} 