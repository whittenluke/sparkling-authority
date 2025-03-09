'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CarbonationSpectrum } from './CarbonationSpectrum'

export function CarbonationGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent"
      >
        <h2 className="text-lg font-medium text-foreground">Understanding Carbonation Levels</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-border">
          <CarbonationSpectrum />
        </div>
      )}
    </div>
  )
} 