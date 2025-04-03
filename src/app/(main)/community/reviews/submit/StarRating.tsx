'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          onMouseEnter={() => setHover(rating)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              (hover || value) >= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-yellow-400/25'
            }`}
          />
        </button>
      ))}
    </div>
  )
} 