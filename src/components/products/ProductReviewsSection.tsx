'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

export type ProductReview = {
  user_id: string
  created_at: string
  overall_rating: number
  review_text: string | null
  moderation_status: string | null
  profiles: { display_name: string | null } | null
}

type ProductReviewsSectionProps = {
  reviews: ProductReview[]
  sessionUserId: string | undefined
}

const RATING_OPTIONS = [5, 4, 3, 2, 1] as const

export function ProductReviewsSection({ reviews, sessionUserId }: ProductReviewsSectionProps) {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  const filtered =
    ratingFilter == null ? reviews : reviews.filter((r) => r.overall_rating === ratingFilter)

  const countForRating = (rating: number) => reviews.filter((r) => r.overall_rating === rating).length

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-foreground">Reviews</h2>

      {reviews.length > 0 && (
        <div className="mt-3 w-fit flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => setRatingFilter(null)}
            className={`flex w-fit items-center gap-2 rounded py-1.5 pr-1 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${ratingFilter === null
                ? 'bg-primary/10 text-primary'
                : 'bg-transparent text-foreground hover:bg-muted'
              }`}
          >
            <span className="w-[5.5rem]">All</span>
            <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">
              {reviews.length}
            </span>
          </button>
          {RATING_OPTIONS.map((rating) => {
            const count = countForRating(rating)
            const isActive = ratingFilter === rating
            return (
              <button
                key={rating}
                type="button"
                onClick={() => setRatingFilter(rating)}
                className={`flex w-fit items-center gap-2 rounded py-1.5 pr-1 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-transparent text-foreground hover:bg-muted'
                  }`}
              >
                <span className="flex w-[5.5rem] gap-0.5" aria-hidden>
                  {Array.from({ length: rating }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="shrink-0 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </span>
                <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-4 space-y-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {reviews.length === 0 ? 'No reviews yet.' : 'No reviews match this filter.'}
          </p>
        ) : (
          filtered.map((review) => (
            <div
              key={review.user_id}
              className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.profiles?.display_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {new Date(review.created_at).toLocaleDateString()}
                </span>
                {sessionUserId === review.user_id && review.moderation_status !== 'approved' && (
                  <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20">
                    Pending Review
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-0.5">
                {getStarFillPercentages(review.overall_rating).map((percentage, index) => (
                  <PartialStar
                    key={index}
                    fillPercentage={percentage}
                    size={16}
                  />
                ))}
              </div>
              {review.review_text && (
                <p className="mt-3 text-sm text-foreground">
                  {review.review_text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
