'use client'

import { useTheme } from '@/components/theme-provider'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Brand = {
  id: string
  name: string
  slug: string
  brand_logo_light: string | null
  brand_logo_dark: string | null
  products: { count: number }[]
}

export function BrowseByBrand() {
  const { theme } = useTheme()
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchBrands() {
      const { data } = await supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          brand_logo_light,
          brand_logo_dark,
          products (count)
        `)
        .order('name', { ascending: false })
        .limit(9)

      if (data) {
        setBrands(data)
      }
    }

    fetchBrands()
  }, [])

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-clash-display text-2xl font-medium text-primary sm:text-3xl">
          Browse by Brand
        </h2>
        <Link 
          href="/explore/brands"
          className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
        >
          View All Brands
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {brands.map((brand) => {
          const logoUrl = theme === 'dark' ? brand.brand_logo_dark : brand.brand_logo_light
          const hasLogo = logoUrl !== undefined && logoUrl !== null

          return (
            <Link
              key={brand.id}
              href={`/explore/brands/${brand.slug}`}
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border hover:ring-primary transition-all text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center mb-4 overflow-hidden">
                {hasLogo ? (
                  <div className="h-full w-full bg-white rounded-xl flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt={brand.name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full p-2"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl font-medium">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-h-[3rem] flex items-center justify-center">
                <h3 className="text-base font-clash-display font-medium text-primary">
                  {brand.name}
                </h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
