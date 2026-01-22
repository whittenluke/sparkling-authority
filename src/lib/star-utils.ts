/**
 * Calculate fill percentages for each star based on a rating
 * @param rating - The rating value (e.g., 4.7)
 * @returns Array of 5 numbers representing fill percentages (0-100) for each star
 */
export function getStarFillPercentages(rating: number): number[] {
  const clampedRating = Math.max(0, Math.min(5, rating))
  const percentages: number[] = []

  for (let i = 1; i <= 5; i++) {
    if (clampedRating >= i) {
      // Full star
      percentages.push(100)
    } else if (clampedRating >= i - 1) {
      // Partial star - calculate remaining percentage
      const remaining = clampedRating - (i - 1)
      percentages.push(remaining * 100)
    } else {
      // Empty star
      percentages.push(0)
    }
  }

  return percentages
}
