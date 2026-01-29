'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

type BrandSearchProps = {
  onSearchChange: (query: string) => void
}

export function BrandSearch({ onSearchChange }: BrandSearchProps) {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  useEffect(() => {
    // Only trigger search if search value is empty or has 2+ characters
    if (debouncedSearchValue.length === 0 || debouncedSearchValue.length >= 2) {
      onSearchChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, onSearchChange])

  return (
    <div className="relative flex-grow">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search brands..."
        className="font-plus-jakarta block w-full rounded-lg border border-input py-3 pl-10 pr-4 text-foreground bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
      />
    </div>
  )
}
