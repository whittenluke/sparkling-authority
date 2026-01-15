'use client'

import Link from 'next/link'
import { ExternalLink, ShoppingCart } from 'lucide-react'

type WhereToBuyProps = {
  amazonLink?: string | null
  walmartLink?: string | null
  instacartLink?: string | null
  brandLink?: string | null
  brandName: string
}

export function WhereToBuy({
  amazonLink,
  walmartLink,
  instacartLink,
  brandLink,
  brandName
}: WhereToBuyProps) {
  const retailers = [
    { name: 'Amazon', link: amazonLink, color: 'orange' },
    { name: 'Walmart', link: walmartLink, color: 'blue' },
    { name: 'Instacart', link: instacartLink, color: 'green' },
    { name: brandName, link: brandLink, color: 'default' }
  ].filter(r => r.link) // Only show retailers with links

  if (retailers.length === 0) return null

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Where to Buy
      </h3>
      <div className="flex flex-wrap gap-2">
        {retailers.map((retailer) => (
          <Link
            key={retailer.name}
            href={retailer.link!}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/80 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {retailer.name}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Link>
        ))}
      </div>
    </div>
  )
}
