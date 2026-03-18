'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { Check, X, Inbox } from 'lucide-react'

type SubmissionStatus = 'pending' | 'approved' | 'rejected'

interface Submission {
  id: string
  brand_name: string
  product_name: string
  image_url: string | null
  notes: string | null
  status: SubmissionStatus
  created_at: string
}

const TABS = [
  { id: 'pending', label: 'Pending', status: 'pending' as SubmissionStatus },
  { id: 'approved', label: 'Approved', status: 'approved' as SubmissionStatus },
  { id: 'rejected', label: 'Rejected', status: 'rejected' as SubmissionStatus },
] as const

export default function AdminSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>('pending')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const loadSubmissions = useCallback(async (status: SubmissionStatus) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('product_submissions')
        .select('id, brand_name, product_name, image_url, notes, status, created_at')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Database error:', fetchError)
        setError('Failed to load submissions')
        return
      }

      setSubmissions((data as Submission[]) ?? [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSubmissions(activeTab)
  }, [activeTab, loadSubmissions])

  async function updateStatus(submissionId: string, newStatus: SubmissionStatus) {
    try {
      setActionLoading(submissionId)
      setError(null)

      const { error: updateError } = await supabase
        .from('product_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId)

      if (updateError) {
        console.error('Error updating submission:', updateError)
        setError(`Failed to mark as ${newStatus}`)
        return
      }

      setSubmissions(prev => prev.filter(s => s.id !== submissionId))
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-muted-foreground">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
        <p className="mt-2 text-muted-foreground">
          Suggested products from users. Mark as approved or rejected; create brands and products in Brands &amp; Products.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

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
              {activeTab === tab.status && submissions.length > 0 && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-primary/10 text-primary">
                  {submissions.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {submissions.length > 0 ? (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-lg border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {sub.brand_name} — {sub.product_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sub.created_at).toLocaleString()}
                  </p>
                  {sub.image_url && (
                    <p className="text-sm text-muted-foreground truncate">
                      Image: <a href={sub.image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{sub.image_url}</a>
                    </p>
                  )}
                  {sub.notes && (
                    <p className="mt-2 text-sm text-foreground">{sub.notes}</p>
                  )}
                </div>
                {activeTab === 'pending' && (
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => updateStatus(sub.id, 'approved')}
                      disabled={actionLoading === sub.id}
                      className="rounded-md bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-500 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark as approved
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'rejected')}
                      disabled={actionLoading === sub.id}
                      className="rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark as rejected
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No {activeTab} submissions
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === 'pending'
                ? 'New suggestions will appear here when users submit flavors.'
                : `No submissions have been ${activeTab} yet.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
