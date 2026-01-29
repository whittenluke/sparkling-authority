/**
 * Product utility functions for rating calculations and transformations
 */

type Review = {
  overall_rating: number
  is_approved?: boolean
}

type ProductWithReviews = {
  reviews?: Review[]
  [key: string]: any
}

type ProductWithRatings = {
  averageRating?: number // Bayesian average (for sorting)
  trueAverage?: number // True average (for display)
  ratingCount: number
  [key: string]: any
}

/**
 * Calculate the mean rating across all products
 */
export function calculateMeanRating(products: ProductWithReviews[]): number {
  const allRatings = products.flatMap(p => 
    p.reviews?.map(r => r.overall_rating) || []
  )
  
  return allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 3.5 // Fallback to 3.5 if no ratings exist
}

/**
 * Calculate ratings for a single product
 * Returns both Bayesian average (for sorting) and true average (for display)
 */
export function calculateProductRatings(
  product: ProductWithReviews,
  meanRating: number
): {
  averageRating: number | undefined
  trueAverage: number | undefined
  ratingCount: number
} {
  // Use ALL ratings regardless of approval status - approval only matters for review text
  const ratings = product.reviews?.map(r => r.overall_rating) || []
  const ratingCount = ratings.length

  if (ratingCount === 0) {
    return {
      averageRating: undefined,
      trueAverage: undefined,
      ratingCount: 0
    }
  }

  // Calculate Bayesian average (for sorting)
  const C = 10 // confidence factor
  const sumOfRatings = ratings.reduce((a, b) => a + b, 0)
  const bayesianAverage = (C * meanRating + sumOfRatings) / (C + ratingCount)

  // Calculate true average (for display)
  const trueAverage = sumOfRatings / ratingCount

  return {
    averageRating: bayesianAverage,
    trueAverage: trueAverage,
    ratingCount
  }
}

/**
 * Transform a product with reviews into a product with calculated ratings
 */
export function transformProductWithRatings(
  product: ProductWithReviews,
  meanRating: number
): ProductWithRatings {
  const ratings = calculateProductRatings(product, meanRating)
  
  return {
    ...product,
    ...ratings
  }
}

/**
 * Transform multiple products with reviews into products with calculated ratings
 */
export function transformProductsWithRatings(
  products: ProductWithReviews[],
  meanRating: number
): ProductWithRatings[] {
  return products.map(product => transformProductWithRatings(product, meanRating))
}
