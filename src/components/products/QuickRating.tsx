'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase/client'

interface QuickRatingProps {
  productId: string
  productName: string
  brandName: string
  initialRating?: number
  averageRating?: number
  totalRatings?: number
}

export function QuickRating({ 
  productId, 
  productName, 
  brandName,
  initialRating,
  averageRating,
  totalRatings 
}: QuickRatingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isRatingMode, setIsRatingMode] = useState(false)
  const [hover, setHover] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleRatingClick = () => {
    if (!user) {
      // Store current URL for redirect after login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsRatingMode(true)
  }

  const submitRating = async (rating: number) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Check for existing rating
      const { data: existingRating } = await supabase
        .from('product_ratings')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      if (existingRating) {
        // Update existing rating
        await supabase
          .from('product_ratings')
          .update({ rating })
          .eq('id', existingRating.id)
      } else {
        // Insert new rating
        await supabase
          .from('product_ratings')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating
          })
      }

      setSuccessMessage(`Thanks for rating ${brandName} ${productName}!`)
      setTimeout(() => setSuccessMessage(''), 3000) // Clear message after 3 seconds
      router.refresh() // Refresh the page to update average rating
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
      setIsRatingMode(false)
    }
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
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                typeof averageRating === 'number' && star <= averageRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-yellow-400/25'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rating Interface */}
      <div className="flex items-center gap-4">
        {isRatingMode ? (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                disabled={isSubmitting}
                onClick={() => submitRating(rating)}
                onMouseEnter={() => setHover(rating)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hover || initialRating || 0) >= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-transparent text-yellow-400/25'
                  }`}
                />
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={handleRatingClick}
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            {initialRating ? 'Update Rating' : 'Rate Product'}
          </button>
        )}

        {/* Success Message */}
        {successMessage && (
          <span className="text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </span>
        )}
      </div>
    </div>
  )
} 