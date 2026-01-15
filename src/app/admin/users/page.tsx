'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { ExternalLink, MessageSquare, Search, Shield, User, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  website: string | null
  avatar_url: string | null
  is_admin: boolean
  reputation_score: number
  created_at: string
  updated_at: string
  ratings_count: number
  review_count: number
}

type SortField = 'username' | 'created_at' | 'reputation_score' | 'review_count' | 'updated_at'
type SortDirection = 'asc' | 'desc'

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const supabase = createClientComponentClient()

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get users with their review counts
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' })

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        setError('Failed to load users')
        return
      }

      if (!profilesData) {
        setUsers([])
        return
      }

      // Get ratings counts for each user (all reviews including ratings without text)
      const userIds = profilesData.map(profile => profile.id)
      const { data: allRatings, error: ratingsError } = await supabase
        .from('reviews')
        .select('user_id')
        .in('user_id', userIds)

      // Get review counts for each user (only reviews with text content)
      const { data: reviewCounts, error: reviewsError } = await supabase
        .from('reviews')
        .select('user_id')
        .in('user_id', userIds)
        .not('review_text', 'is', null)
        .neq('review_text', '')

      if (ratingsError) {
        console.error('Error loading ratings counts:', ratingsError)
      }
      if (reviewsError) {
        console.error('Error loading review counts:', reviewsError)
        // Don't fail completely if counts fail
      }

      // Count ratings per user (all reviews)
      const ratingsCountMap = (allRatings || []).reduce((acc, review) => {
        acc[review.user_id] = (acc[review.user_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count reviews per user (only with text)
      const reviewCountMap = (reviewCounts || []).reduce((acc, review) => {
        acc[review.user_id] = (acc[review.user_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Check admin status for each user by querying the admins table
      // Since we can't access auth.users emails directly, we'll need to check admin status differently
      // For now, we'll assume only the current admin user should show as admin
      // This is a simplified approach - in production you'd want a more robust solution

      // Combine profile data with both counts
      const usersWithCounts = profilesData.map(profile => ({
        ...profile,
        ratings_count: ratingsCountMap[profile.id] || 0,
        review_count: reviewCountMap[profile.id] || 0,
        // For now, admin status will be determined by the is_admin field in profiles
        // In your setup, this field might not be used, so admins will show as regular users
        // except for the current logged-in admin
        is_admin: profile.is_admin // This field exists but may not be populated
      }))

      // Apply search filter
      const filteredUsers = searchTerm
        ? usersWithCounts.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : usersWithCounts

      setUsers(filteredUsers)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, sortField, sortDirection, searchTerm])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor user activity and access user information
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th
                  className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('username')}
                >
                  User {getSortIcon('username')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('reputation_score')}
                >
                  Reputation {getSortIcon('reputation_score')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ratings
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('review_count')}
                >
                  Reviews {getSortIcon('review_count')}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('created_at')}
                >
                  Joined {getSortIcon('created_at')}
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('updated_at')}
                >
                  Last Active {getSortIcon('updated_at')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name || user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {user.display_name || user.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.reputation_score}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.ratings_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.review_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(user.id)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Copy User ID"
                      >
                        <span className="text-xs">ID</span>
                      </button>
                      <Link
                        href={`/profile?user=${user.id}`}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="View Profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/reviews?user=${user.id}`}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="View Reviews"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {users.length} user{users.length !== 1 ? 's' : ''}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </div>
  )
}
