'use client'

import { useState } from 'react'
import { parseReviewFullSections } from '@/lib/review-full-utils'

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
        <p className="mt-4 text-sm text-muted-foreground">
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
          {expanded && (() => {
            const [taste, carbonation, value] = parseReviewFullSections(reviewFull)
            return (
              <div className="mt-4 rounded-lg border border-border bg-sky-50/90 dark:bg-sky-950/20 shadow-sm px-4 py-3">
                {taste && (
                  <>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Taste & Flavor</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{taste}</p>
                  </>
                )}
                {carbonation && (
                  <div className={taste ? 'mt-3' : ''}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Carbonation & Mouthfeel</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{carbonation}</p>
                  </div>
                )}
                {value && (
                  <div className={taste || carbonation ? 'mt-3' : ''}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Value & Use Cases</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{value}</p>
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
