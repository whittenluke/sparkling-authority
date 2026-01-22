'use client'

import Link from 'next/link'
import { ExternalLink, ShoppingCart, Info } from 'lucide-react'

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
    <div className="flex flex-wrap gap-2 my-6">
      {retailers.map((retailer) => (
        <Link
          key={retailer.name}
          href={retailer.link!}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/10 dark:hover:bg-muted transition-colors"
        >
          {retailer.name === brandName ? (
            <Info className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {retailer.name}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </Link>
      ))}
    </div>
  )
}
