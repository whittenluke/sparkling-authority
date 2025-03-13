'use client';

import { TwitterIcon, FacebookIcon, LinkedinIcon } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = [
    {
      platform: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: TwitterIcon
    },
    {
      platform: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookIcon
    },
    {
      platform: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: LinkedinIcon
    }
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">Share</span>
      {shareLinks.map(({ platform, url, icon: Icon }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Share on ${platform}`}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
} 