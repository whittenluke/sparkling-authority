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
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false)
  const [sheetRating, setSheetRating] = useState<number>(0)
  const [sheetError, setSheetError] = useState<string>('')

  const productUrl = `/explore/brands/${product.brand.slug}/products/${product.slug}`
  const displayAverage = typeof product.trueAverage === 'number' ? product.trueAverage : null
  const displayCount = optimisticCount ?? product.ratingCount
  const effectiveAverage = optimisticAverage ?? displayAverage ?? 0
  const hasRatingData = displayAverage != null || optimisticAverage != null

  const submitRating = useCallback(
    async (rating: number) => {
      if (isSubmitting || rating < 1 || rating > 5) return false
      setIsSubmitting(true)
      let didInsert = false
      const currentCount = Number(product.ratingCount)
      const currentAverage =
        typeof displayAverage === 'number' && Number.isFinite(displayAverage) ? displayAverage : NaN

      const canUseCurrentAverage = Number.isFinite(currentAverage)
      // Default to the product's displayed average so we never end up showing the user's raw rating
      // when optimistic average calculation can't be performed reliably.
      let nextAverage: number = canUseCurrentAverage ? currentAverage : rating
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
              nextAverage = canUseCurrentAverage ? currentAverage : rating
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
            } else nextAverage = canUseCurrentAverage ? currentAverage : rating
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
          } else nextAverage = canUseCurrentAverage ? currentAverage : rating
        }
        setOptimisticAverage(nextAverage)
        if (didInsert) setOptimisticCount((c) => (c ?? product.ratingCount) + 1)
        setShowThanks(true)
        return true
      } catch {
        // Silent fail or toast in future
        if (isRatingSheetOpen) {
          setSheetError('Failed to submit rating. Please try again.')
        }
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [product.id, product.ratingCount, user, supabase, isSubmitting, displayAverage, isRatingSheetOpen]
  )

  const handleStarClick = (e: React.MouseEvent, rating: number) => {
    e.preventDefault()
    e.stopPropagation()
    void submitRating(rating)
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
      <div className="pt-0.5 min-w-0" role="group" aria-label="Rate this product">
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
            {/* Mobile: open rating bottom sheet */}
            <div className="sm:hidden">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-0.5 -m-0.5"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSheetError('')
                  setSheetRating(0)
                  setIsRatingSheetOpen(true)
                }}
                aria-label="Rate this product"
              >
                <div className="flex items-center gap-0.5 min-w-0">
                  {hasRatingData && (
                    <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
                      {effectiveAverage.toFixed(1)}
                    </span>
                  )}
                  <div className="flex gap-0.5 flex-shrink-0 items-center min-h-[10px]">
                    {getStarFillPercentages(effectiveAverage).map((fill, idx) => (
                      <span key={idx} aria-hidden className="inline-flex items-center justify-center">
                        <PartialStar fillPercentage={fill} size={14} />
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {displayCount === 0
                    ? 'No ratings yet'
                    : `${displayCount} rating${displayCount !== 1 ? 's' : ''}`}
                </p>
              </button>
            </div>

            {/* Desktop: fast star selection */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-0.5 min-w-0">
                {hasRatingData && (
                  <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
                    {effectiveAverage.toFixed(1)}
                  </span>
                )}
                <div className="flex gap-0.5 flex-shrink-0 items-center min-h-[10px] sm:min-h-[14px]">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = hoverRating > 0 ? star <= hoverRating : star <= effectiveAverage
                    const fill = active
                      ? 100
                      : hoverRating > 0
                        ? 0
                        : getStarFillPercentages(effectiveAverage)[star - 1] ?? 0
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
                        <PartialStar fillPercentage={fill} size={STAR_SIZE_DESKTOP} />
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
            </div>
          </>
        )}
      </div>

      {/* Rating bottom sheet (mobile) */}
      {isRatingSheetOpen && !showThanks && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsRatingSheetOpen(false)}
            aria-label="Close rating sheet"
          />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-2xl bg-card p-4 shadow-xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Rate this product</h3>
              <button
                type="button"
                onClick={() => setIsRatingSheetOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSheetError('')
                    setSheetRating(star)
                  }}
                  disabled={isSubmitting}
                  aria-label={`Select ${star} stars`}
                >
                  <PartialStar fillPercentage={sheetRating >= star ? 100 : 0} size={26} />
                </button>
              ))}
            </div>

            {sheetError && <p className="mt-2 text-sm text-destructive">{sheetError}</p>}

            <button
              type="button"
              onClick={async () => {
                if (!sheetRating) return
                setSheetError('')
                const ok = await submitRating(sheetRating)
                if (ok) setIsRatingSheetOpen(false)
              }}
              disabled={sheetRating === 0 || isSubmitting}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit rating'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
