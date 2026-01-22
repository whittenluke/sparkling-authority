'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MessageSquare } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { ReviewModal } from '@/components/products/ReviewModal'
import { createClientComponentClient } from '@/lib/supabase/client'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'

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
  flavor_tags: string[]
  thumbnail?: string | null
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userReview, setUserReview] = useState<{ rating?: number; review?: string } | null>(null)
  const supabase = createClientComponentClient()

  const fetchUserReview = useCallback(async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('reviews')
      .select('overall_rating, review_text')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setUserReview({
        rating: data.overall_rating,
        review: data.review_text
      })
    } else {
      setUserReview(null)
    }
  }, [user, product.id, supabase])

  useEffect(() => {
    fetchUserReview()

    // Set up real-time subscription for user's review
    const channel = supabase
      .channel(`product-${product.id}-reviews`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${product.id}`
        },
        () => {
          fetchUserReview()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchUserReview, product.id, supabase])

  const handleRateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      // Store current URL for redirect after login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Refresh the user's review when modal closes
    fetchUserReview()
  }

  return (
    <div className="relative group block rounded-xl bg-card p-4 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-primary transition-all">
      <Link 
        href={`/explore/brands/${product.brand.slug}/products/${product.slug}`}
        className="block"
      >
        <div className="flex gap-4">
          {/* Product Thumbnail */}
          <div className="h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-foreground text-xl font-medium">
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Product Content */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Top: Title and Rating */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground group-hover:text-primary text-base truncate pr-4">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-medium text-foreground">
                {typeof product.trueAverage === 'number' ? product.trueAverage.toFixed(1) : 'N/A'}
              </span>
              <div className="flex gap-0.5">
                {typeof product.trueAverage === 'number'
                  ? getStarFillPercentages(product.trueAverage).map((percentage, index) => (
                      <PartialStar
                        key={index}
                        fillPercentage={percentage}
                        size={16}
                      />
                    ))
                  : [1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-transparent text-yellow-400/25"
                      />
                    ))
                }
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.ratingCount})
              </span>
            </div>
          </div>

          {/* Bottom: Brand and Tags */}
          <div>
            <p className="text-sm text-muted-foreground">
              by {product.brand.name}
            </p>
            {product.flavor_tags && product.flavor_tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {product.flavor_tags.map((flavor) => (
                  <span
                    key={flavor}
                    className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </Link>

      {/* Rate/Review Button - Positioned absolutely */}
      <button
        onClick={handleRateClick}
        className="absolute bottom-4 right-4 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/90 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md"
      >
        <MessageSquare className="h-4 w-4" />
        {userReview?.rating ? 'Update Rating' : 'Rate/Review'}
      </button>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        productId={product.id}
        productName={product.name}
        brandName={product.brand.name}
        initialRating={userReview?.rating}
        initialReview={userReview?.review}
      />
    </div>
  )
}
