'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type NutritionInfo = {
  calories: number
  total_fat: number
  sodium: number
  total_carbohydrates: number
  total_sugars: number
  protein: number
  serving_size: string
}

type NutritionDropdownProps = {
  nutrition: NutritionInfo
}

export function NutritionDropdown({ nutrition }: NutritionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4 rounded-lg bg-card shadow-sm ring-1 ring-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-accent transition-colors sm:px-6 sm:py-2.5"
      >
        <h3 className="text-base font-medium text-foreground sm:text-lg">Nutrition Facts</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <dl className="divide-y divide-border">
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Serving Size</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.serving_size}
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Calories</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.calories}
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Total Fat</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.total_fat}g
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Sodium</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.sodium}mg
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Total Carbohydrates</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.total_carbohydrates}g
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Total Sugars</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.total_sugars}g
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Protein</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {nutrition.protein}g
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}

