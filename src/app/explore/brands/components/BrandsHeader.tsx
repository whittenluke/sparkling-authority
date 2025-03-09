'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export function BrandsHeader() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Title and Description */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Brands</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Discover and explore the world&apos;s finest sparkling water brands.
        </p>
      </div>

      {/* Search and Filters */}
      <div>
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search brands..."
              className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {isFiltersOpen && (
          <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Founded Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Founded</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm">
                  <option>Any year</option>
                  <option>Before 1900</option>
                  <option>1900-1950</option>
                  <option>1950-2000</option>
                  <option>After 2000</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm">
                  <option>All types</option>
                  <option>Major brands</option>
                  <option>Craft/Artisanal</option>
                  <option>Store brands</option>
                </select>
              </div>

              {/* Sort */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm">
                  <option>Name (A-Z)</option>
                  <option>Newest first</option>
                  <option>Most popular</option>
                  <option>Most products</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 