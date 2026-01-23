'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MessageSquare } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { ReviewModal } from '@/components/products/ReviewModal'
import { createClientComponentClient } from '@/lib/supabase/client'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  brand: Brand
  flavor_tags: string[]
  thumbnail?: string | null
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
}

interface ProductCardHorizontalProps {
  product: Product
}

export function ProductCardHorizontal({ product }: ProductCardHorizontalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userReview, setUserReview] = useState<{ rating?: number; review?: string } | null>(null)
  const supabase = createClientComponentClient()

  const fetchUserReview = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('reviews')
      .select('overall_rating, review_text')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setUserReview({
        rating: data.overall_rating,
        review: data.review_text
      })
    } else {
      setUserReview(null)
    }
  }, [user, product.id, supabase])

  useEffect(() => {
    fetchUserReview()

    // Set up real-time subscription for user's review
    const channel = supabase
      .channel(`product-${product.id}-reviews`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${product.id}`
        },
        () => {
          fetchUserReview()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchUserReview, product.id, supabase])

  const handleRateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      // Store current URL for redirect after login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Refresh the user's review when modal closes
    fetchUserReview()
  }

  return (
    <div className="relative group block rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all w-64 flex-shrink-0 min-h-[140px]">
      <Link
        href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
        className="block h-full"
      >
        <div className="flex flex-col gap-3 h-full">
          {/* Top Row: Thumbnail and Rating */}
          <div className="flex items-start justify-between">
            {/* Product Thumbnail */}
            <div className="h-14 w-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  width={56}
                  height={56}
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-foreground text-base font-medium">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Rating Section - Right Aligned */}
            <div className="flex flex-col items-end shrink-0">
              <span className="font-semibold text-foreground text-base">
                {typeof product.trueAverage === 'number' ? product.trueAverage.toFixed(1) : 'N/A'}
              </span>
              <div className="flex gap-0.5 mt-1">
                {typeof product.trueAverage === 'number'
                  ? getStarFillPercentages(product.trueAverage).map((percentage, index) => (
                      <PartialStar
                        key={index}
                        fillPercentage={percentage}
                        size={14}
                      />
                    ))
                  : [1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3.5 w-3.5 fill-transparent text-yellow-400/25"
                      />
                    ))
                }
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                ({product.ratingCount})
              </span>
            </div>
          </div>

          {/* Bottom Section: Title, Brand, Tags */}
          <div className="flex flex-col gap-2 flex-1">
            {/* Product Title */}
            <h3 className="font-semibold text-foreground group-hover:text-primary text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>

            {/* Brand */}
            <p className="text-xs text-muted-foreground">
              by {product.brand.name}
            </p>

            {/* Flavor Tags */}
            {product.flavor_tags && product.flavor_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {product.flavor_tags.slice(0, 2).map((flavor) => (
                  <span
                    key={flavor}
                    className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                  >
                    {flavor}
                  </span>
                ))}
                {product.flavor_tags.length > 2 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{product.flavor_tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Rate/Review Button - Positioned absolutely */}
      <button
        onClick={handleRateClick}
        className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/90 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm"
      >
        <MessageSquare className="h-3 w-3" />
        {userReview?.rating ? 'Update' : 'Rate'}
      </button>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        productId={product.id}
        productName={product.name}
        brandName={product.brand.name}
        initialRating={userReview?.rating}
        initialReview={userReview?.review}
      />
    </div>
  )
}
