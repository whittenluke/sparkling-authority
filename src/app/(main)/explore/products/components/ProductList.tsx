'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ProductCard } from './ProductCard'

interface ProductListProps {
  searchQuery: string
}

type Brand = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  slug: string
  brand: Brand
  flavor: string[]
  averageRating: number
  ratingCount: number
}

const PRODUCTS_PER_PAGE = 12

export function ProductList({ searchQuery }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const fetchProducts = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const start = (pageNum - 1) * PRODUCTS_PER_PAGE
      const end = start + PRODUCTS_PER_PAGE - 1
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          flavor,
          brand:brand_id (
            id,
            name,
            slug
          ),
          reviews (
            overall_rating
          )
        `)
        .range(start, end)
        .order('name', { ascending: true })
        
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }
      
      const { data, error } = await query
      
      if (error) {
        setError('Error fetching products')
        return []
      }
      
      const transformedProducts = data.map(product => {
        const ratings = product.reviews?.map(r => r.overall_rating) || []
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0
        
        const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: {
            id: brand.id,
            name: brand.name,
            slug: brand.slug
          },
          flavor: product.flavor || [],
          averageRating,
          ratingCount: ratings.length
        }
      })
      
      setHasMore(transformedProducts.length === PRODUCTS_PER_PAGE)
      return transformedProducts
    } catch (err) {
      setError('An unexpected error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }, [searchQuery])
  
  useEffect(() => {
    const loadInitialProducts = async () => {
      setPage(1)
      setHasMore(true)
      const initialProducts = await fetchProducts(1)
      setProducts(initialProducts)
    }
    
    loadInitialProducts()
  }, [searchQuery, fetchProducts])
  
  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 100 &&
        !loading &&
        hasMore
      ) {
        const nextPage = page + 1
        const newProducts = await fetchProducts(nextPage)
        if (newProducts.length > 0) {
          setProducts(prev => [...prev, ...newProducts])
          setPage(nextPage)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, loading, hasMore, fetchProducts])
  
  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    )
  }
  
  if (loading && products.length === 0) {
    return (
      <div className="text-center">
        Loading products...
      </div>
    )
  }
  
  if (!products.length) {
    return (
      <div className="text-center text-muted-foreground">
        No products found matching your search.
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {loading && products.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Loading more products...
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No more products to load
        </div>
      )}
    </div>
  )
} 