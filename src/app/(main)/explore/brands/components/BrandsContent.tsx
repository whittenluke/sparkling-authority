'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { BrandsHeader } from './BrandsHeader'
import { BrandsGrid } from './BrandsGrid'

type BrandEntry = {
  id: string
  name: string
  description?: string
  brand_logo_light?: string
  brand_logo_dark?: string
  productCount: number
  isProductLine: boolean
  slug: string
}

type BrandsContentProps = {
  initialBrands: BrandEntry[]
}

export function BrandsContent({ initialBrands }: BrandsContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [brands, setBrands] = useState<BrandEntry[]>(initialBrands)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch brands based on search query
  const fetchBrands = useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setBrands(initialBrands)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          brand_logo_light,
          brand_logo_dark,
          products (
            id
          )
        `)
        .ilike('name', `%${searchQuery}%`)
        .order('name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      const brandEntries: BrandEntry[] = (data || []).map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || undefined,
        brand_logo_light: brand.brand_logo_light || undefined,
        brand_logo_dark: brand.brand_logo_dark || undefined,
        productCount: brand.products?.length || 0,
        isProductLine: false
      }))

      setBrands(brandEntries)
    } catch (err) {
      console.error('Error fetching brands:', err)
      setError('Error fetching brands: ' + (err instanceof Error ? err.message : String(err)))
      setBrands([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, supabase, initialBrands])

  // Load search results when query changes
  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  return (
    <div className="space-y-8">
      <BrandsHeader onSearchChange={setSearchQuery} />
      
      {error && (
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-muted-foreground py-8">
          Loading brands...
        </div>
      )}

      {!loading && !error && (
        <>
          {brands.length === 0 && searchQuery.length >= 2 ? (
            <div className="text-center text-muted-foreground py-8">
              No brands found for &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          ) : (
            <BrandsGrid brands={brands} />
          )}
        </>
      )}
    </div>
  )
}
