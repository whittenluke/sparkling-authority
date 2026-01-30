'use client'

import { useState } from 'react'

type AuthorityReviewSectionProps = {
  verdict: string | null
  reviewFull: string | null
}

export function AuthorityReviewSection({ verdict, reviewFull }: AuthorityReviewSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const hasVerdict = verdict?.trim()
  const hasReviewFull = reviewFull?.trim()

  if (!hasVerdict && !hasReviewFull) return null

  return (
    <div>
      {hasVerdict && (
        <p className="mt-4 text-muted-foreground">
          {verdict}
        </p>
      )}
      {hasReviewFull && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="mt-3 inline-flex items-center rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {expanded ? 'Hide full review' : 'Read full review'}
          </button>
          {expanded && (
            <div className="mt-4 rounded-lg border border-border bg-card shadow-sm px-4 py-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {reviewFull}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
