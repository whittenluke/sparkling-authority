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
        <h2 className="text-2xl font-bold text-foreground">Products</h2>
        
        {/* Product Line Filter */}
        {productLines.length > 0 && (
          <div className="w-72">
            <Listbox value={selectedLine} onChange={setSelectedLine}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-card py-2.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm">
                  <span className="block truncate text-foreground">
                    {selectedLine ? (selectedLine.is_default ? 'Original' : selectedLine.name) : 'All Products'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card py-1 text-base shadow-lg ring-1 ring-border focus:outline-none sm:text-sm">
                    <Listbox.Option
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                          active ? 'bg-accent text-accent-foreground' : 'text-foreground'
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
                            active ? 'bg-accent text-accent-foreground' : 'text-foreground'
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
                                active ? 'text-accent-foreground' : 'text-muted-foreground'
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
          <p className="text-sm text-muted-foreground">
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
            className="group block rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-primary"
          >
            <div className="flex items-start gap-5">
              {/* Product Image Placeholder */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted group-hover:bg-accent">
                <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground">
                  {product.name.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-foreground group-hover:text-primary">
                  {product.name}
                </h3>
                {product.flavor && product.flavor.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.flavor.map(flavor => (
                      <span 
                        key={flavor} 
                        className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
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