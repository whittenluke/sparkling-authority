import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terms of Service | Sparkling Authority',
  description: 'Terms of Service for Sparkling Authority. Please read these terms carefully before using our website and services.',
  openGraph: {
    title: 'Terms of Service | Sparkling Authority',
    description: 'Terms of Service for Sparkling Authority. Please read these terms carefully before using our website and services.',
    type: 'website',
    url: 'https://sparklingauthority.com/terms',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Sparkling Authority',
    description: 'Terms of Service for Sparkling Authority. Please read these terms carefully before using our website and services.',
  }
}

export default function TermsPage() {
  return (
    <div className="prose prose-lg max-w-none [&>*]:text-foreground [&_p]:text-foreground/90 [&_li]:text-foreground/90 [&_strong]:text-foreground">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Terms of Service – Sparkling Authority
        </h1>
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> January 5, 2026
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <p>
            Welcome to Sparkling Authority (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website, <a href="https://www.sparklingauthority.com" className="text-primary hover:underline">www.sparklingauthority.com</a>, you agree to the following terms. Please read them carefully.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Use of the Site</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may use the site for personal, non-commercial purposes only.</li>
            <li>You agree not to use the site for unlawful purposes or to interfere with the functionality of the website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Certain features, like rating sparkling water products, require an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login information.</li>
            <li>You may delete your account at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Content</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ratings, comments, or reviews you submit may be publicly displayed.</li>
            <li>You retain ownership of your content but grant Sparkling Authority a license to use it for display, aggregation, and promotional purposes.</li>
            <li>Do not post content that is illegal, abusive, or infringes on the rights of others.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All content on Sparkling Authority, including text, graphics, and site design, is owned by us or our licensors and is protected by copyright and other intellectual property laws.</li>
            <li>You may not reproduce, distribute, or create derivative works without our written permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Third-Party Services</h2>
          <p>
            Our site may use third-party services (e.g., Google Analytics, OAuth). Use of these services is subject to their own terms and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Disclaimers</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sparkling Authority is provided &quot;as is&quot; without warranties of any kind.</li>
            <li>We do not guarantee accuracy, completeness, or reliability of ratings, reviews, or other content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Sparkling Authority is not liable for any damages arising from your use of the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Changes will be posted on this page with an updated effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact</h2>
          <p>
            For questions regarding these Terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:smuuuvshop@gmail.com" className="text-primary hover:underline">smuuuvshop@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

