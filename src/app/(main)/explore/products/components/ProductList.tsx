'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ProductCard } from './ProductCard'

interface ProductListProps {
  searchQuery: string
}

type Product = {
  id: string
  name: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

export function ProductList({ searchQuery }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          brand:brand_id (
            id,
            name,
            slug
          )
        `)
        
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }
      
      const { data, error } = await query.order('name')
      
      if (error) {
        setError('Error fetching products')
        setProducts([])
      } else {
        const transformedProducts = data.map(product => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: Array.isArray(product.brand) ? product.brand[0] : product.brand
        }))
        setProducts(transformedProducts)
      }
      
      setLoading(false)
    }
    
    fetchProducts()
  }, [searchQuery])
  
  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    )
  }
  
  if (loading) {
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
} 