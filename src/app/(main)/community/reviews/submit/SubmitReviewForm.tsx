'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState } from 'react'
import { StarRating } from './StarRating'

export function SubmitReviewForm() {
  const {} = useAuth()
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm dark:shadow-none opacity-75">
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
              disabled
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Review submission coming soon
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm font-medium rounded-md 
                     bg-primary text-primary-foreground
                     opacity-50 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </form>
    </div>
  )
} 