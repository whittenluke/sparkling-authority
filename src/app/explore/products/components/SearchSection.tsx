'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

type SearchCategory = 'product' | 'brand' | 'flavor' | 'carbonation'

export function SearchSection() {
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('product')

  return (
    <div className="space-y-4">
      {/* Segmented Control */}
      <div className="flex rounded-lg bg-muted p-1">
        {(['product', 'brand', 'flavor', 'carbonation'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors
              ${selectedCategory === category 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-background/50'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search Input */}
      {selectedCategory === 'carbonation' ? (
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="10"
            defaultValue="5"
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Light (1)</span>
            <span>Strong (10)</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-input bg-background py-4 pl-10 pr-4 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      )}
    </div>
  )
} 