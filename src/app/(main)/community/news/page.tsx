import { Metadata } from 'next'
import { fetchSparklingWaterNews } from '@/lib/news/google-news'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes

export const metadata: Metadata = {
  title: 'Sparkling Water News & Updates | Sparkling Authority',
  description: 'Stay up to date with the latest sparkling water news, industry updates, and brand announcements. Your source for everything happening in the world of sparkling water.',
  openGraph: {
    title: 'Sparkling Water News & Updates | Sparkling Authority',
    description: 'Stay up to date with the latest sparkling water news, industry updates, and brand announcements. Your source for everything happening in the world of sparkling water.',
    type: 'website',
    url: 'https://sparklingauthority.com/community/news',
    images: [
      {
        url: '/images/news/news-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Sparkling water news and updates on Sparkling Authority',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparkling Water News & Updates | Sparkling Authority',
    description: 'Stay up to date with the latest sparkling water news, industry updates, and brand announcements. Your source for everything happening in the world of sparkling water.',
    images: ['/images/news/news-hero.webp'],
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Sparkling Water News & Updates',
  description: 'Latest news and updates from the world of sparkling water.',
  publisher: {
    '@type': 'Organization',
    name: 'Sparkling Authority',
    url: 'https://sparklingauthority.com'
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [] // Will be populated with actual news items
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Loading news...</p>
    </div>
  )
}

async function NewsContent() {
  const newsItems = await fetchSparklingWaterNews()

  return (
    <div className="space-y-6">
      {newsItems.map((item) => (
        <article
          key={item.link}
          className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block space-y-3"
          >
            <h2 className="text-lg font-medium text-foreground hover:text-primary transition-colors">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{item.source}</span>
              <span>•</span>
              <time dateTime={item.pubDate}>
                {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}
              </time>
            </div>
          </a>
        </article>
      ))}

      {newsItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No news articles found at the moment.
        </div>
      )}
    </div>
  )
}

export default function NewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sparkling Water News</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Stay informed about the latest developments in the sparkling water industry. News, trends, and announcements.
          </p>
        </div>
        
        <Suspense fallback={<LoadingState />}>
          <NewsContent />
        </Suspense>
      </div>
    </>
  )
} 