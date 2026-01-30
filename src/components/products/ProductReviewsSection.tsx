'use client'

import { useState } from 'react'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

export type ProductReview = {
  user_id: string
  created_at: string
  overall_rating: number
  review_text: string | null
  is_approved: boolean
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
        <div className="mt-3 inline-flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setRatingFilter(null)}
            className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 border-r border-border py-2.5 px-2 text-sm font-medium transition-colors first:rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
              ratingFilter === null
                ? 'bg-primary/10 text-primary'
                : 'bg-transparent text-foreground hover:bg-muted'
            }`}
          >
            <span>All</span>
            <span className="text-xs text-muted-foreground tabular-nums">{reviews.length}</span>
          </button>
          {RATING_OPTIONS.map((rating, index) => {
            const count = countForRating(rating)
            const isActive = ratingFilter === rating
            const isLast = index === RATING_OPTIONS.length - 1
            return (
              <button
                key={rating}
                type="button"
                onClick={() => setRatingFilter(rating)}
                className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 py-2.5 px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                  !isLast ? 'border-r border-border' : ''
                } ${isLast ? 'rounded-r-lg' : ''} ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-transparent text-foreground hover:bg-muted'
                }`}
              >
                <span>{rating}★</span>
                <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
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
                <span className="font-medium text-foreground">
                  {review.profiles?.display_name || 'Anonymous'}
                </span>
                <span className="text-sm text-muted-foreground">
                  • {new Date(review.created_at).toLocaleDateString()}
                </span>
                {sessionUserId === review.user_id && !review.is_approved && (
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
                <p className="mt-3 text-foreground">
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
