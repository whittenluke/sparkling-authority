export type ArticleMetadata = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  estimatedReadingTime?: number;
  metaDescription?: string;
}

export type ArticleCategory = 'health' | 'brands' | 'sustainability' | 'science';

export type ArticleSeries = {
  id: string;
  title: string;
  articles: {
    id: string;
    title: string;
    slug: string;
  }[];
  currentArticleIndex: number;
}

// Minimal version used in related articles
export type ArticlePreview = Pick<ArticleMetadata, 'id' | 'title' | 'slug' | 'excerpt' | 'publishedAt'>; 