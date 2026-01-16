'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { MessageSquare, Users, Star, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  pendingReviews: number
  totalUsers: number
  newUsers: number
  totalReviews: number
}

interface RecentReview {
  id: string
  review_text: string
  overall_rating: number
  moderation_status: string
  created_at: string
  user: {
    display_name: string | null
    username: string
  }
  product: {
    name: string
  }
  brand: {
    name: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingReviews: 0,
    totalUsers: 0,
    newUsers: 0,
    totalReviews: 0
  })
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Get pending reviews count (reviews with text that need moderation)
        const { count: pendingCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('moderation_status', 'pending')
          .not('review_text', 'is', null)
          .neq('review_text', '')

        // Get total users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Get new users in last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const { count: newUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString())

        // Get total reviews count (reviews with text)
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .not('review_text', 'is', null)
          .neq('review_text', '')

        setStats({
          pendingReviews: pendingCount || 0,
          totalUsers: usersCount || 0,
          newUsers: newUsersCount || 0,
          totalReviews: reviewsCount || 0
        })

        // Get recent reviews (last 5)
        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            id,
            review_text,
            overall_rating,
            moderation_status,
            created_at,
            profiles:user_id (
              display_name,
              username
            ),
            products (
              name,
              brands (
                name
              )
            )
          `)
          .not('review_text', 'is', null)
          .neq('review_text', '')
          .order('created_at', { ascending: false })
          .limit(5)

        if (reviews) {
          const formattedReviews = reviews.map(review => ({
            id: review.id,
            review_text: review.review_text,
            overall_rating: review.overall_rating,
            moderation_status: review.moderation_status,
            created_at: review.created_at,
            user: {
              display_name: review.profiles?.[0]?.display_name || null,
              username: review.profiles?.[0]?.username || 'Unknown'
            },
            product: {
              name: review.products?.[0]?.name || 'Unknown Product'
            },
            brand: {
              name: review.products?.[0]?.brands?.[0]?.name || 'Unknown Brand'
            }
          }))
          setRecentReviews(formattedReviews)
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  const statCards = [
    {
      name: 'Pending Reviews',
      value: stats.pendingReviews.toString(),
      icon: MessageSquare,
      href: '/admin/reviews?tab=pending',
      description: 'Reviews awaiting moderation'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      href: '/admin/users',
      description: 'Registered users'
    },
    {
      name: 'New Users (7d)',
      value: stats.newUsers.toString(),
      icon: TrendingUp,
      href: '/admin/users',
      description: 'Recent signups'
    },
    {
      name: 'Total Reviews',
      value: stats.totalReviews.toString(),
      icon: Star,
      href: '/admin/reviews',
      description: 'Reviews with text content'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-2 text-muted-foreground">Monitor your site&apos;s activity and user engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Reviews */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Reviews</h2>
          <Link
            href="/admin/reviews"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">
                        {review.brand.name} - {review.product.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        by {review.user.display_name || review.user.username}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {review.review_text}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>★ {review.overall_rating}/5</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        review.moderation_status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : review.moderation_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {review.moderation_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/admin/reviews?tab=pending"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Moderate Reviews</p>
                <p className="text-sm text-muted-foreground">Review and approve user content</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Manage Users</p>
                <p className="text-sm text-muted-foreground">View user activity and profiles</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  )
}
