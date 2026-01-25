'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type IngredientsDropdownProps = {
  ingredients: string
}

export function IngredientsDropdown({ ingredients }: IngredientsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 rounded-lg bg-card shadow-sm ring-1 ring-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent transition-colors sm:px-6 sm:py-4"
      >
        <h3 className="text-base font-medium text-foreground sm:text-lg">Ingredients</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-sm text-muted-foreground">
            {ingredients}
          </p>
        </div>
      )}
    </div>
  )
}

