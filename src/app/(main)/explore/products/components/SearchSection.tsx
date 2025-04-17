'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

type SearchSectionProps = {
  onSearchChange: (query: string) => void
}

export function SearchSection({ onSearchChange }: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  useEffect(() => {
    onSearchChange(debouncedSearchValue)
  }, [debouncedSearchValue, onSearchChange])

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search products by name, brand, or flavor..."
        className="block w-full rounded-lg border border-input bg-background py-4 pl-10 pr-4 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  )
} 