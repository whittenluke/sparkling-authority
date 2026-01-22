'use client'

import { Star } from 'lucide-react'

interface PartialStarProps {
  fillPercentage: number // 0-100
  size?: number // size in pixels, default 16
  className?: string
}

export function PartialStar({ fillPercentage, size = 16, className = '' }: PartialStarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, fillPercentage))

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Background star (empty) */}
      <Star
        size={size}
        className="absolute inset-0 fill-transparent text-yellow-400/25"
      />
      {/* Foreground star (filled) with clip-path for partial fill */}
      <Star
        size={size}
        className="absolute inset-0 fill-yellow-400 text-yellow-400"
        style={{
          clipPath: `inset(0 ${100 - clampedPercentage}% 0 0)`,
        }}
      />
    </div>
  )
}
