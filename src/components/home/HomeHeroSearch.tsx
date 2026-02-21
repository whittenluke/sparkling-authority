'use client'

import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchResults } from '@/app/(main)/explore/products/components/SearchResults'

const PLACEHOLDER = 'Search products by name, brand, or flavor...'

export function HomeHeroSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue.trim(), 400)

  const searchTriggered = debouncedSearch.length >= 2
  const [dropdownVisible, setDropdownVisible] = useState(false)

  useEffect(() => {
    setDropdownVisible(searchTriggered)
  }, [searchTriggered])

  const showDropdown = searchTriggered && dropdownVisible

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    router.push(q.length >= 2 ? `/explore/products?q=${encodeURIComponent(q)}` : '/explore/products')
  }

  useEffect(() => {
    if (!showDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-xl border border-input bg-background shadow-sm ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => debouncedSearch.length >= 2 && setDropdownVisible(true)}
            placeholder={PLACEHOLDER}
            className="block w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
            aria-label={PLACEHOLDER}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          />
        </div>
      </form>

      {/* Dropdown overlay – same results as explore/products */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5 dark:ring-white/5 overflow-hidden"
          role="listbox"
        >
          <div className="max-h-[min(70vh,28rem)] overflow-auto p-4">
            <SearchResults
              searchQuery={debouncedSearch}
              scope="products"
              variant="dropdown"
            />
          </div>
        </div>
      )}
    </div>
  )
}
