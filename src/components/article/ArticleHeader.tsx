import { ArticleMetadata } from '@/types/article';
import { formatArticleDate } from '@/lib/article-utils';
import Image from 'next/image';

interface ArticleHeaderProps {
  metadata: ArticleMetadata;
  heroImage?: {
    src: string;
    alt: string;
  };
}

export function ArticleHeader({ metadata, heroImage }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
        {metadata.title}
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          {metadata.author.image && (
            <Image
              src={metadata.author.image}
              alt={metadata.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span>{metadata.author.name}</span>
        </div>
        <time dateTime={metadata.publishedAt}>
          {formatArticleDate(metadata.publishedAt)}
        </time>
        {metadata.estimatedReadingTime && (
          <span>{metadata.estimatedReadingTime} min read</span>
        )}
      </div>

      {heroImage && (
        <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </header>
  );
} 