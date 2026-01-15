import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | Sparkling Authority',
  description: 'Learn about our affiliate relationships and commitment to editorial independence at Sparkling Authority.',
}

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
        Affiliate Disclosure
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last Updated: January 2026
      </p>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Our Commitment to Transparency
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sparkling Authority is an independent resource dedicated to helping you discover and explore sparkling water products. We believe in being completely transparent about how we operate and how this site is funded.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Affiliate Relationships
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Sparkling Authority participates in affiliate advertising programs, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Amazon Associates Program</li>
            <li>Walmart Affiliate Program</li>
            <li>Instacart Affiliate Program</li>
            <li>Other retail affiliate networks</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            When you click on certain links to retailers on our site and make a purchase, we may earn a small commission at no additional cost to you. These are called affiliate links.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            How This Works
          </h2>
          <ul className="space-y-3">
            <li>
              <strong className="text-foreground">No extra cost to you:</strong>{' '}
              <span className="text-muted-foreground">
                Affiliate commissions do not increase the price you pay
              </span>
            </li>
            <li>
              <strong className="text-foreground">Links are clearly identified:</strong>{' '}
              <span className="text-muted-foreground">
                Product links that may generate commissions are part of our normal product listings and comparison features
              </span>
            </li>
            <li>
              <strong className="text-foreground">You choose where to buy:</strong>{' '}
              <span className="text-muted-foreground">
                We provide links to multiple retailers when available, giving you options
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Our Editorial Independence
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our affiliate relationships do not influence our reviews, ratings, or recommendations. We maintain strict editorial independence:
          </p>
          <ul className="space-y-3">
            <li>
              <strong className="text-foreground">Honest reviews:</strong>{' '}
              <span className="text-muted-foreground">
                Products are reviewed and rated based on their actual qualities, not commission potential
              </span>
            </li>
            <li>
              <strong className="text-foreground">Unbiased ratings:</strong>{' '}
              <span className="text-muted-foreground">
                Our rating system reflects genuine assessment of taste, value, and quality
              </span>
            </li>
            <li>
              <strong className="text-foreground">No paid placements:</strong>{' '}
              <span className="text-muted-foreground">
                Brands and retailers do not pay for favorable reviews or higher rankings
              </span>
            </li>
            <li>
              <strong className="text-foreground">Real opinions:</strong>{' '}
              <span className="text-muted-foreground">
                All reviews and content reflect our actual experience and research
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We organize and present sparkling water products to help you make informed decisions. The products we feature and how we rate them are determined by our own evaluation criteria, not by affiliate commission rates.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Questions?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about our affiliate relationships or how we operate, please contact us at{' '}
            <a href="mailto:sparklingauthority@gmail.com" className="text-primary hover:underline">
              sparklingauthority@gmail.com
            </a>
          </p>
        </section>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            This disclosure is provided in accordance with the Federal Trade Commission's 16 CFR Part 255: "Guides Concerning the Use of Endorsements and Testimonials in Advertising."
          </p>
        </div>
      </div>
    </div>
  )
}
