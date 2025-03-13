import { ArticleMetadata } from '@/types/article';

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function formatArticleDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateTableOfContents(content: string): { id: string; text: string; level: number }[] {
  // Basic implementation to extract headings from content
  const headingRegex = /<h([2-3])\s+id="([^"]+)"[^>]*>([^<]+)<\/h[2-3]>/g;
  const toc: { id: string; text: string; level: number }[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    toc.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].trim()
    });
  }
  
  return toc;
}

export function getArticleSchema(article: ArticleMetadata): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name
    }
  };
}

export function getSocialShareLinks(article: ArticleMetadata): { platform: string; url: string }[] {
  const encodedTitle = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(`https://sparklingauthority.com/learn/${article.slug}`);
  
  return [
    {
      platform: 'twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      platform: 'facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      platform: 'linkedin',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
    }
  ];
} 