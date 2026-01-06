import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sparkling Authority',
  description: 'Privacy Policy for Sparkling Authority. Learn how we collect, use, and protect your information when you visit our website and use our services.',
  openGraph: {
    title: 'Privacy Policy | Sparkling Authority',
    description: 'Privacy Policy for Sparkling Authority. Learn how we collect, use, and protect your information when you visit our website and use our services.',
    type: 'website',
    url: 'https://sparklingauthority.com/privacy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Sparkling Authority',
    description: 'Privacy Policy for Sparkling Authority. Learn how we collect, use, and protect your information when you visit our website and use our services.',
  }
}

export default function PrivacyPage() {
  return (
    <div className="prose prose-lg max-w-none [&>*]:text-foreground [&_p]:text-foreground/90 [&_li]:text-foreground/90 [&_strong]:text-foreground">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Privacy Policy – Sparkling Authority
        </h1>
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> January 5, 2026
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <p>
            Sparkling Authority (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website, <a href="https://www.sparklingauthority.com" className="text-primary hover:underline">www.sparklingauthority.com</a>, and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you create an account using Google OAuth or other login methods, we collect your email and basic account details.
            </li>
            <li>
              <strong>Ratings and Reviews:</strong> When you rate a sparkling water product, we collect your ratings and any optional comments you provide.
            </li>
            <li>
              <strong>Usage Data:</strong> We may collect data on how you interact with the site (pages visited, clicks, etc.) using tools like Google Analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our website and services.</li>
            <li>Aggregate user ratings and display top products.</li>
            <li>Improve user experience and troubleshoot issues.</li>
            <li>Comply with legal obligations if required.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Sharing Your Information</h2>
          <p>
            We do not sell or share your personal information with third parties for marketing purposes. Aggregate, anonymized data may be shared for analytics or reporting purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to improve site functionality, track analytics, and enhance user experience. You can manage or disable cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Third-Party Services</h2>
          <p>
            Our site may use third-party services (e.g., Google Analytics, Google OAuth) that collect and process data according to their own privacy policies. We encourage you to review those policies for more information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Choices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You can delete your account at any time.</li>
            <li>You can opt out of analytics tracking via browser settings or ad-blockers.</li>
            <li>You can contact us to request access to or deletion of your personal data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Security</h2>
          <p>
            We take reasonable measures to protect your data, but no website or service is completely secure. Use the site at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:smuuuvshop@gmail.com" className="text-primary hover:underline">smuuuvshop@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

