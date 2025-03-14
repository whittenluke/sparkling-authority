'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StarRating } from './StarRating'

export function SubmitReviewForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/community/reviews/submit')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm dark:shadow-none">
      <form className="p-6 space-y-6">
        {/* Product Search - Placeholder for now */}
        <div>
          <label htmlFor="product-search" className="text-sm font-medium text-foreground">
            Search for a Product
          </label>
          <div className="mt-1.5">
            <input
              type="text"
              id="product-search"
              placeholder="Search for a sparkling water product..."
              className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary/20 dark:focus:ring-primary/30"
              disabled
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Product search functionality coming soon
            </p>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium text-foreground">Rating</label>
          <div className="mt-1.5">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="text-sm font-medium text-foreground">
            Your Review
          </label>
          <div className="mt-1.5">
            <textarea
              id="review-text"
              rows={8}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary/20 dark:focus:ring-primary/30 resize-none"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Minimum 50 characters required
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={review.length < 50 || rating === 0}
            className="px-4 py-2 text-sm font-medium rounded-md 
                     bg-primary text-primary-foreground hover:bg-primary/90
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  )
} 