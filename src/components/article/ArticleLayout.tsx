'use client';

import { SocialShare } from './SocialShare';
import { TableOfContents } from './TableOfContents';
import { formatArticleDate, calculateReadingTime } from '@/lib/article-utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ArticleLayoutProps {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
  category: 'health' | 'brands' | 'sustainability' | 'science';
  tags: string[];
  heroImage?: {
    src: string;
    alt: string;
  };
  children: React.ReactNode;
}

export function ArticleLayout({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  category,
  tags,
  heroImage,
  children
}: ArticleLayoutProps) {
  // Extract headings for table of contents
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    // Get all h2 and h3 elements from the content, not the header
    const contentElement = document.querySelector('article');
    if (contentElement) {
      const headingElements = contentElement.querySelectorAll('h2, h3');
      console.log('Found headings:', headingElements);
      const extractedHeadings = Array.from(headingElements).map(heading => ({
        id: heading.id || '',
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      })).filter(heading => heading.id && heading.text);
      console.log('Extracted headings:', extractedHeadings);
      setHeadings(extractedHeadings);

      // Calculate reading time
      const content = contentElement.textContent || '';
      setReadingTime(calculateReadingTime(content));
    }
  }, []);

  return (
    <>
      {headings.length > 0 && (
        <aside className="hidden lg:block fixed left-[calc(50%-560px)] top-24 w-[240px]">
          <TableOfContents headings={headings} />
        </aside>
      )}
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <article className="prose prose-lg [&>*]:text-foreground [&_p]:text-foreground/90 [&_li]:text-foreground/90 [&_strong]:text-foreground">
          <header className="not-prose mb-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span className="capitalize">{category}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            
            <p className="mt-4 text-lg text-muted-foreground">
              {description}
            </p>

            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <time dateTime={publishedAt}>
                Published {formatArticleDate(publishedAt)}
              </time>
              {publishedAt !== updatedAt && (
                <>
                  <span>•</span>
                  <time dateTime={updatedAt}>
                    Updated {formatArticleDate(updatedAt)}
                  </time>
                </>
              )}
            </div>

            <div className="mt-8">
              <SocialShare url={url} title={title} />
            </div>

            {heroImage && (
              <div className="aspect-[1200/630] relative overflow-hidden rounded-lg mt-8">
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
          
          {children}

          <div className="mt-16 pt-8 border-t border-muted">
            <SocialShare url={url} title={title} />
          </div>
        </article>
      </div>
    </>
  );
} 