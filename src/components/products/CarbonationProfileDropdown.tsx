'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const BUBBLE_SIZE_OPTIONS = ['Small', 'Medium', 'Large'] as const
const PERSISTENCE_OPTIONS = ['Short', 'Moderate', 'Long'] as const
const INTENSITY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const SEGMENT_GROUP_WIDTH = 'min-w-[12rem] w-48'
const INTENSITY_GROUP_WIDTH = 'min-w-[12rem] w-48'

type CarbonationProfileDropdownProps = {
  carbonationLevel: number | null
  bubbleSize: string | null
  persistence: string | null
}

export function CarbonationProfileDropdown({
  carbonationLevel,
  bubbleSize,
  persistence
}: CarbonationProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 rounded-lg bg-card shadow-sm ring-1 ring-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-accent transition-colors sm:px-6 sm:py-2.5"
      >
        <h3 className="text-base font-medium text-foreground sm:text-lg">Carbonation Profile</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 py-2 sm:px-6 sm:py-2.5">
          <div className="grid gap-3">
            {carbonationLevel != null && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">Intensity</span>
                <div className={`grid grid-cols-10 ${INTENSITY_GROUP_WIDTH}`} role="list" aria-label="Intensity 1 to 10">
                  {INTENSITY_LEVELS.map((level, i) => {
                    const highlighted = level <= carbonationLevel
                    return (
                      <span
                        key={level}
                        className={`text-center py-0.5 text-xs font-medium tabular-nums ${i === 0 ? 'rounded-l-full' : i === 9 ? 'rounded-r-full' : 'rounded-none'} ${highlighted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                      >
                        {level}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Bubble Size</span>
              <div className={`grid grid-cols-3 ${SEGMENT_GROUP_WIDTH}`} role="list" aria-label="Bubble size">
                {BUBBLE_SIZE_OPTIONS.map((option, i) => {
                  const selected = bubbleSize === option
                  return (
                    <span
                      key={option}
                      className={`text-center py-0.5 text-xs font-medium ${i === 0 ? 'rounded-l-full' : i === 2 ? 'rounded-r-full' : 'rounded-none'} ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {option}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Persistence</span>
              <div className={`grid grid-cols-3 ${SEGMENT_GROUP_WIDTH}`} role="list" aria-label="Persistence">
                {PERSISTENCE_OPTIONS.map((option, i) => {
                  const selected = persistence === option
                  return (
                    <span
                      key={option}
                      className={`text-center py-0.5 text-xs font-medium ${i === 0 ? 'rounded-l-full' : i === 2 ? 'rounded-r-full' : 'rounded-none'} ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {option}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
