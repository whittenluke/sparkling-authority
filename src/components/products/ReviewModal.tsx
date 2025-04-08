'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  brandName: string
  initialRating?: number
  initialReview?: string
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  brandName,
  initialRating = 0,
  initialReview = ''
}: ReviewModalProps) {
  const [review, setReview] = useState(initialReview)
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!user) {
      setError('You must be logged in to submit a review')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Check for existing review
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        // Update existing review
        await supabase
          .from('reviews')
          .update({ 
            overall_rating: rating,
            review_text: review,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id)
      } else {
        // Insert new review
        await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            overall_rating: rating,
            review_text: review,
            is_approved: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      router.refresh()
      onClose()
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Rate & Review
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="text-sm text-muted-foreground">
            {brandName} {productName}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hover || rating) >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-transparent text-yellow-400/25'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Required to submit
              </p>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium mb-1.5">
                Your Review
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="w-full min-h-[150px] p-3 rounded-md border bg-background text-foreground
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                         focus:ring-primary/20 dark:focus:ring-primary/30 resize-none"
              />
              <p className="mt-1.5 text-sm text-muted-foreground">
                Optional but encouraged
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md 
                         bg-accent text-accent-foreground hover:bg-accent/80
                         transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-md 
                         bg-primary text-primary-foreground hover:bg-primary/90
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 