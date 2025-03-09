'use client'

import Link from 'next/link'

type BrandEntry = {
  id: string
  name: string
  description?: string
  productCount: number
  isProductLine: boolean
  productLineId?: string
}

export function BrandsGrid({ brands }: { brands: BrandEntry[] }) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {brands.map((brand) => (
        <Link
          key={brand.isProductLine ? `${brand.id}-${brand.productLineId}` : brand.id}
          href={brand.isProductLine 
            ? `/explore/brands/${brand.id}/line/${brand.productLineId}`
            : `/explore/brands/${brand.id}`
          }
          className="group flex items-center gap-4 rounded-xl bg-white/95 dark:bg-gray-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-md hover:ring-blue-600 dark:hover:ring-blue-500 transition-all"
        >
          <div className="h-12 w-12 rounded-lg bg-sky-50 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 text-xl font-medium">
            {brand.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {brand.name}
            </h3>
            {brand.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{brand.description}</p>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
          </div>
        </Link>
      ))}
    </div>
  )
} 