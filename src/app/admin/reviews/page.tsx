'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Check, X, Inbox } from 'lucide-react'

interface Review {
  id: number
  user_id: string
  product_id: string
  rating: number
  review_text: string
  is_approved: boolean
  created_at: string
  user_email: string
  product_name: string
  brand_name: string
}

export default function AdminReviews() {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  async function loadPendingReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            display_name
          ),
          products (
            name,
            brands (
              name
            )
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        setError('Failed to load reviews')
        return
      }

      // Transform the data to match our interface
      const transformedReviews = data?.map(review => ({
        id: review.id,
        user_id: review.user_id,
        product_id: review.product_id,
        rating: review.overall_rating,
        review_text: review.review_text,
        is_approved: review.is_approved,
        created_at: review.created_at,
        user_email: review.profiles?.display_name || 'Anonymous',
        product_name: review.products?.name || 'Unknown Product',
        brand_name: review.products?.brands?.name || 'Unknown Brand'
      })) || []

      setPendingReviews(transformedReviews)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function approveReview(reviewId: number) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) {
        console.error('Error approving review:', error)
        setError('Failed to approve review')
        return
      }

      // Remove the approved review from the list
      setPendingReviews(reviews => reviews.filter(r => r.id !== reviewId))
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    }
  }

  useEffect(() => {
    loadPendingReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-muted-foreground">Loading reviews...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          {pendingReviews.length} pending {pendingReviews.length === 1 ? 'review requires' : 'reviews require'} moderation
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {pendingReviews.length > 0 ? (
          pendingReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {review.brand_name} - {review.product_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By {review.user_email} • Rating: {review.rating}/5 • 
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveReview(review.id)}
                    className="rounded-md bg-green-500/10 p-2 text-green-500 hover:bg-green-500/20"
                    title="Approve review"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement reject */}}
                    className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                    title="Reject review"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-foreground">{review.review_text}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No pending reviews</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              All reviews have been moderated. New reviews will appear here when submitted.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 