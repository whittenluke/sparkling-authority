import { ArticleMetadata } from '@/types/article';
import { ArticleHeader } from './ArticleHeader';
import { TableOfContents } from './TableOfContents';
import { SocialShare } from './SocialShare';
import { generateTableOfContents } from '@/lib/article-utils';

interface ArticleLayoutProps {
  metadata: ArticleMetadata;
  heroImage?: {
    src: string;
    alt: string;
  };
  children: React.ReactNode;
}

export function ArticleLayout({ metadata, heroImage, children }: ArticleLayoutProps) {
  // We'll generate TOC from the content - this is a placeholder
  const headings = generateTableOfContents('');
  
  return (
    <article className="max-w-3xl mx-auto py-8">
      <ArticleHeader metadata={metadata} heroImage={heroImage} />
      
      <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
        <div className="prose dark:prose-invert max-w-none">
          {children}
          
          <hr className="my-8" />
          
          <div className="flex items-center justify-between">
            <SocialShare article={metadata} />
            <time className="text-sm text-muted-foreground">
              Last updated: {new Date(metadata.updatedAt).toLocaleDateString()}
            </time>
          </div>
        </div>
        
        {headings.length > 0 && (
          <div className="hidden lg:block">
            <TableOfContents headings={headings} />
          </div>
        )}
      </div>
    </article>
  );
} 