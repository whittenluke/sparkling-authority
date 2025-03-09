'use client'

import { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  flavor: string[]
  product_line_id: string
}

type ProductLine = {
  id: string
  name: string
  description: string | null
  is_default: boolean
}

export function ProductsSection({ 
  products, 
  productLines 
}: { 
  products: Product[]
  productLines: ProductLine[]
}) {
  // State for selected product line (default to first line if exists)
  const [selectedLine, setSelectedLine] = useState<ProductLine | null>(
    productLines[0] || null
  )

  // Filter products by selected line
  const filteredProducts = selectedLine
    ? products.filter(p => p.product_line_id === selectedLine.id)
    : products

  return (
    <div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h2>
        
        {/* Product Line Filter */}
        {productLines.length > 0 && (
          <div className="w-72">
            <Listbox value={selectedLine} onChange={setSelectedLine}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white/95 dark:bg-gray-800 py-2.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm">
                  <span className="block truncate text-gray-900 dark:text-gray-100">
                    {selectedLine ? (selectedLine.is_default ? 'Original' : selectedLine.name) : 'All Products'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none sm:text-sm">
                    <Listbox.Option
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                          active ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                        }`
                      }
                      value={null}
                    >
                      All Products
                    </Listbox.Option>
                    {productLines.map((line) => (
                      <Listbox.Option
                        key={line.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                            active ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                          }`
                        }
                        value={line}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {line.is_default ? 'Original' : line.name}
                            </span>
                            {line.description && (
                              <span className={`block truncate text-sm ${
                                active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {line.description}
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        )}

        {/* Selected Line Description */}
        {selectedLine?.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedLine.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="mt-6 space-y-4">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/explore/products/${product.id}`}
            className="group block rounded-xl bg-white/95 dark:bg-gray-800 p-5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all hover:shadow-md hover:ring-blue-200 dark:hover:ring-blue-500"
          >
            <div className="flex items-start gap-5">
              {/* Product Image Placeholder */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sky-50 dark:bg-gray-700 group-hover:bg-sky-100 dark:group-hover:bg-gray-600">
                <div className="flex h-full w-full items-center justify-center text-xl text-gray-400 dark:text-gray-500">
                  {product.name.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {product.name}
                </h3>
                {product.flavor && product.flavor.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.flavor.map(flavor => (
                      <span 
                        key={flavor} 
                        className="inline-block rounded-full bg-sky-50 dark:bg-gray-700 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 