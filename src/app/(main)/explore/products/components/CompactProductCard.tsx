'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'
import { createClientComponentClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-context'
import { useCallback, useState } from 'react'

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
  thumbnail?: string | null
  trueAverage?: number
  ratingCount: number
}

interface CompactProductCardProps {
  product: Product
}

const STAR_SIZE_MOBILE = 10
const STAR_SIZE_DESKTOP = 14

export function CompactProductCard({ product }: CompactProductCardProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [optimisticAverage, setOptimisticAverage] = useState<number | null>(null)
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null)

  const productUrl = `/explore/brands/${product.brand.slug}/products/${product.slug}`
  const displayAverage = typeof product.trueAverage === 'number' ? product.trueAverage : null
  const displayCount = optimisticCount ?? product.ratingCount
  const effectiveAverage = optimisticAverage ?? displayAverage ?? 0
  const hasRatingData = displayAverage != null || optimisticAverage != null

  const submitRating = useCallback(
    async (rating: number) => {
      if (isSubmitting || rating < 1 || rating > 5) return
      setIsSubmitting(true)
      let didInsert = false
      const currentCount = Number(product.ratingCount)
      const currentAverage =
        typeof displayAverage === 'number' && Number.isFinite(displayAverage) ? displayAverage : NaN

      let nextAverage: number = rating
      try {
        if (user) {
          const { data: existing } = await supabase
            .from('reviews')
            .select('id, overall_rating')
            .eq('product_id', product.id)
            .eq('user_id', user.id)
            .maybeSingle()

          if (existing) {
            // Authenticated "update": replace the previous rating in the average.
            const previousRating =
              existing && existing.overall_rating != null ? Number(existing.overall_rating) : NaN

            await supabase
              .from('reviews')
              .update({
                overall_rating: rating,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)

            if (
              currentCount > 0 &&
              Number.isFinite(currentAverage) &&
              Number.isFinite(previousRating)
            ) {
              // average = (sum - prev + new) / count
              const nextSum = currentAverage * currentCount - previousRating + rating
              nextAverage = nextSum / currentCount
            } else {
              nextAverage = rating
            }
          } else {
            didInsert = true
            await supabase.from('reviews').insert({
              product_id: product.id,
              user_id: user.id,
              overall_rating: rating,
              review_text: '',
              moderation_status: 'approved',
            })

            // Insert "rating-only": average becomes (sum + rating) / (count + 1)
            if (currentCount > 0 && Number.isFinite(currentAverage)) {
              const nextSum = currentAverage * currentCount + rating
              nextAverage = nextSum / (currentCount + 1)
            } else nextAverage = rating
          }
        } else {
          const res = await fetch('/api/reviews/guest/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId: product.id, rating }),
          })
          const data = await res.json().catch(() => ({}))
          if (res.status !== 200 && res.status !== 201) {
            throw new Error(data.error ?? 'Failed to submit rating')
          }
          if (res.status === 201) didInsert = true

          // Guest insert: average becomes (sum + rating) / (count + 1)
          if (currentCount > 0 && Number.isFinite(currentAverage)) {
            const nextSum = currentAverage * currentCount + rating
            nextAverage = nextSum / (currentCount + 1)
          } else nextAverage = rating
        }
        setOptimisticAverage(nextAverage)
        if (didInsert) setOptimisticCount((c) => (c ?? product.ratingCount) + 1)
        setShowThanks(true)
      } catch {
        // Silent fail or toast in future
      } finally {
        setIsSubmitting(false)
      }
    },
    [product.id, product.ratingCount, user, supabase, isSubmitting, displayAverage]
  )

  const handleStarClick = (e: React.MouseEvent, rating: number) => {
    e.preventDefault()
    e.stopPropagation()
    submitRating(rating)
  }

  const handleStarRowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const writeReviewUrl =
    `${productUrl}?openReview=1&from=${encodeURIComponent(pathname)}` +
    (optimisticAverage != null ? `&rating=${optimisticAverage}` : '')

  return (
    <div className="block rounded-md bg-card p-2 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all overflow-hidden">
      <Link href={productUrl} className="group block">
        <div className="aspect-square w-full rounded overflow-hidden mb-1.5 bg-muted flex items-center justify-center">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              width={200}
              height={200}
              className="object-cover h-full w-full group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-foreground text-xl font-medium">
              {product.name.charAt(0)}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{product.brand.name}</p>
        <h3 className="font-medium text-xs text-foreground group-hover:text-primary line-clamp-2 min-h-[2rem]">
          {product.name}
        </h3>
      </Link>

      {/* Rating: interactive stars or thanks + Write Review */}
      <div className="pt-0.5 min-w-0" onClick={handleStarRowClick} role="group" aria-label="Rate this product">
        {showThanks ? (
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-[11px] font-medium text-foreground">Thanks! Want to leave a quick review?</p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowThanks(false)
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground p-0.5 -m-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <Link
              href={writeReviewUrl}
              className="inline-block text-[11px] font-medium text-primary hover:text-primary/90 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Write Review
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-0.5 min-w-0">
              {hasRatingData && (
                <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
                  {effectiveAverage.toFixed(1)}
                </span>
              )}
              <div className="flex gap-0.5 flex-shrink-0 items-center min-h-[10px] sm:min-h-[14px]">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating > 0 ? star <= hoverRating : star <= effectiveAverage
                  const fill = active ? 100 : hoverRating > 0 ? 0 : (getStarFillPercentages(effectiveAverage)[star - 1] ?? 0)
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={isSubmitting}
                      className="p-0.5 -m-0.5 rounded touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 w-[10px] h-[10px] sm:w-[14px] sm:h-[14px] flex items-center justify-center"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={(e) => handleStarClick(e, star)}
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <PartialStar fillPercentage={fill} size={STAR_SIZE_MOBILE} className="sm:hidden" />
                      <PartialStar fillPercentage={fill} size={STAR_SIZE_DESKTOP} className="hidden sm:block" />
                    </button>
                  )
                })}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {displayCount === 0
                ? 'No ratings yet'
                : `${displayCount} rating${displayCount !== 1 ? 's' : ''}`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
