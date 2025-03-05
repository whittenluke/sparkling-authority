'use client'

import Link from 'next/link'

type Brand = {
  id: string
  name: string
}

export function BrandsGrid({ brands }: { brands: Brand[] }) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/explore/brands/${brand.id}`}
          className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-600 transition-all"
        >
          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 text-xl font-medium">
            {brand.name.charAt(0)}
          </div>
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
            {brand.name}
          </h3>
        </Link>
      ))}
    </div>
  )
} 