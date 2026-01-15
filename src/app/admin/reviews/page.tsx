'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { Check, X, Inbox } from 'lucide-react'

type ModerationStatus = 'pending' | 'approved' | 'rejected'

interface Review {
  id: number
  user_id: string
  product_id: string
  rating: number
  review_text: string
  moderation_status: ModerationStatus
  created_at: string
  user_email: string
  product_name: string
  brand_name: string
}

const TABS = [
  { id: 'pending', label: 'Pending', status: 'pending' as ModerationStatus },
  { id: 'approved', label: 'Approved', status: 'approved' as ModerationStatus },
  { id: 'rejected', label: 'Rejected', status: 'rejected' as ModerationStatus },
] as const

export default function AdminReviews() {
  const [activeTab, setActiveTab] = useState<ModerationStatus>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  const loadReviews = useCallback(async (status: ModerationStatus) => {
    try {
      setLoading(true)
      setError(null)

      const query = supabase
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
        .eq('moderation_status', status)
        .not('review_text', 'is', null)
        .neq('review_text', '')
        .order('created_at', { ascending: false })

      const { data, error } = await query

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
        moderation_status: review.moderation_status as ModerationStatus,
        created_at: review.created_at,
        user_email: review.profiles?.display_name || 'Anonymous',
        product_name: review.products?.name || 'Unknown Product',
        brand_name: review.products?.brands?.name || 'Unknown Brand'
      })) || []

      setReviews(transformedReviews)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadReviews(activeTab)
  }, [activeTab, loadReviews])

  async function moderateReview(reviewId: number, newStatus: ModerationStatus) {
    try {
      setActionLoading(reviewId)
      setError(null)

      const { error } = await supabase
        .from('reviews')
        .update({ moderation_status: newStatus })
        .eq('id', reviewId)

      if (error) {
        console.error('Error updating review:', error)
        setError(`Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} review`)
        return
      }

      // Remove the moderated review from the current list
      setReviews(reviews => reviews.filter(r => r.id !== reviewId))
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const getTabCount = (status: ModerationStatus) => {
    // This is a simplified count - in a real app you'd fetch counts for each tab
    // For now, we'll just show the current loaded count for the active tab
    return activeTab === status ? reviews.length : 0
  }

  if (loading && reviews.length === 0) {
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
          Moderate user reviews and ratings for sparkling water products
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.status)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.status
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
              {getTabCount(tab.status) > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.status
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {getTabCount(tab.status)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-foreground">
                    {review.brand_name} - {review.product_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By {review.user_email} • Rating: {review.rating}/5 •
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {activeTab === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => moderateReview(review.id, 'approved')}
                      disabled={actionLoading === review.id}
                      className="rounded-md bg-green-500/10 p-2 text-green-500 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve review"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => moderateReview(review.id, 'rejected')}
                      disabled={actionLoading === review.id}
                      className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject review"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-4 text-foreground">{review.review_text}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No {activeTab} reviews
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === 'pending'
                ? 'All reviews have been moderated. New reviews will appear here when submitted.'
                : `No reviews have been ${activeTab} yet.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
