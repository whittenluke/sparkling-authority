import { getSocialShareLinks } from '@/lib/article-utils';
import { ArticleMetadata } from '@/types/article';
import { TwitterIcon, FacebookIcon, LinkedinIcon } from 'lucide-react';

const icons = {
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon
};

interface SocialShareProps {
  article: ArticleMetadata;
}

export function SocialShare({ article }: SocialShareProps) {
  const links = getSocialShareLinks(article);
  
  return (
    <div className="flex gap-4 items-center">
      <span className="text-sm text-muted-foreground">Share</span>
      {links.map(({ platform, url }) => {
        const Icon = icons[platform as keyof typeof icons];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">Share on {platform}</span>
          </a>
        );
      })}
    </div>
  );
} 