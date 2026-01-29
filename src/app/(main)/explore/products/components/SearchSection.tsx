'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { ScopeSelector } from './ScopeSelector'

type Scope = 'products' | 'brands'

type SearchSectionProps = {
  scope: Scope
  onScopeChange: (scope: Scope) => void
  onSearchChangeAction: (query: string) => void
}

export function SearchSection({ scope, onScopeChange, onSearchChangeAction }: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  useEffect(() => {
    // Only trigger search if search value is empty or has 2+ characters
    if (debouncedSearchValue.length === 0 || debouncedSearchValue.length >= 2) {
      onSearchChangeAction(debouncedSearchValue)
    }
  }, [debouncedSearchValue, onSearchChangeAction])

  const placeholder = scope === 'products'
    ? 'Search products by name, brand, or flavor...'
    : 'Search brands...'

  return (
    <div className="space-y-3">
      <ScopeSelector scope={scope} onScopeChange={onScopeChange} />
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-input bg-background py-4 pl-10 pr-4 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  )
}
