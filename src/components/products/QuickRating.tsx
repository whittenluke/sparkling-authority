'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
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
}

export function QuickRating({ 
  productId, 
  productName, 
  brandName,
  initialRating,
  averageRating,
  totalRatings,
  initialReview
}: QuickRatingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleButtonClick = () => {
    if (!user) {
      // Store current URL for redirect after login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-3">
      {/* Average Rating Display */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-foreground">
            {typeof averageRating === 'number' ? averageRating.toFixed(1) : 'N/A'}
          </span>
          {typeof totalRatings === 'number' && (
            <span className="text-sm text-muted-foreground">
              ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          {typeof averageRating === 'number'
            ? getStarFillPercentages(averageRating).map((percentage, index) => (
                <PartialStar
                  key={index}
                  fillPercentage={percentage}
                  size={20}
                />
              ))
            : [1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-transparent text-yellow-400/25"
                />
              ))
          }
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/90"
        >
          <Star className="h-4 w-4" />
          {initialRating ? 'Update Rating' : 'Rate Product'}
        </button>
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/90"
        >
          <MessageSquare className="h-4 w-4" />
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
