'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star, MessageSquare, ChevronDown } from 'lucide-react'
import { ReviewModal } from './ReviewModal'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

interface QuickRatingProps {
  productId: string
  productName: string
  brandName: string
  initialRating?: number
  initialReview?: string
  averageRating?: number
  totalRatings: number
  totalReviews: number
  /** When set, the rating block becomes clickable and smooth-scrolls to this element id (e.g. "reviews"). */
  scrollToReviewsId?: string
  /** Larger typography and stars for product page. */
  size?: 'default' | 'large'
}

export function QuickRating({
  productId,
  productName,
  brandName,
  initialRating,
  averageRating,
  totalRatings,
  initialReview,
  scrollToReviewsId,
  size = 'default',
}: QuickRatingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHoveringRating, setIsHoveringRating] = useState(false)

  const isLarge = size === 'large'
  const starSize = isLarge ? 26 : 20
  const starClass = isLarge ? 'h-6 w-6' : 'h-5 w-5'

  const handleButtonClick = () => {
    if (!user) {
      // Store current URL for redirect after login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsModalOpen(true)
  }

  const handleScrollToReviews = () => {
    if (!scrollToReviewsId) return
    const el = document.getElementById(scrollToReviewsId)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const ratingBlock = (
    <div className={isLarge ? 'space-y-2' : 'space-y-1.5'}>
      <div className="flex items-center gap-2">
        <span className={`font-medium text-foreground ${isLarge ? 'text-2xl' : 'text-lg'}`}>
          {typeof averageRating === 'number' ? averageRating.toFixed(1) : 'N/A'}
        </span>
        {typeof totalRatings === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 text-muted-foreground transition-colors ${
              isLarge ? 'text-base' : 'text-sm'
            } ${scrollToReviewsId && isHoveringRating ? 'text-primary underline' : ''}`}
          >
            ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
            {scrollToReviewsId && (
              <ChevronDown className={isLarge ? 'h-4 w-4 shrink-0' : 'h-3.5 w-3.5 shrink-0'} aria-hidden />
            )}
          </span>
        )}
      </div>
      <div className={`flex ${isLarge ? 'gap-1' : 'gap-0.5'}`}>
        {typeof averageRating === 'number'
          ? getStarFillPercentages(averageRating).map((percentage, index) => (
              <PartialStar
                key={index}
                fillPercentage={percentage}
                size={starSize}
              />
            ))
          : [1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`${starClass} fill-transparent text-yellow-400/25`}
              />
            ))}
      </div>
    </div>
  )

  return (
    <div className={isLarge ? 'space-y-4' : 'space-y-3'}>
      {/* Average Rating Display - clickable when scrollToReviewsId is set */}
      {scrollToReviewsId ? (
        <button
          type="button"
          onClick={handleScrollToReviews}
          onMouseEnter={() => setIsHoveringRating(true)}
          onMouseLeave={() => setIsHoveringRating(false)}
          className="cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          aria-label={`Scroll to reviews (${totalRatings} rating${totalRatings !== 1 ? 's' : ''})`}
        >
          {ratingBlock}
        </button>
      ) : (
        <div>{ratingBlock}</div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleButtonClick}
          className={`flex items-center gap-1.5 font-medium text-primary hover:text-primary/90 ${isLarge ? 'text-base' : 'text-sm'}`}
        >
          <Star className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
          {initialRating ? 'Update Rating' : 'Rate Product'}
        </button>
        <button
          onClick={handleButtonClick}
          className={`flex items-center gap-1.5 font-medium text-primary hover:text-primary/90 ${isLarge ? 'text-base' : 'text-sm'}`}
        >
          <MessageSquare className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
          {initialReview ? 'Update Review' : 'Write a Review'}
        </button>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        brandName={brandName}
        initialRating={initialRating}
        initialReview={initialReview}
      />
    </div>
  )
}
