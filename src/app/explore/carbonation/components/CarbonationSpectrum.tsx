'use client'

import { useState } from 'react'

const carbonationLevels = [
  { level: 1, description: 'Very Light - Barely noticeable bubbles, extremely subtle' },
  { level: 2, description: 'Light - Gentle effervescence, soft texture' },
  { level: 3, description: 'Light-Medium - Noticeable but delicate carbonation' },
  { level: 4, description: 'Medium-Light - Balanced bubbles, refreshing' },
  { level: 5, description: 'Medium - Classic sparkling water feel' },
  { level: 6, description: 'Medium-Strong - Pronounced fizz, energetic' },
  { level: 7, description: 'Strong - Vigorous bubbles, bold sensation' },
  { level: 8, description: 'Very Strong - Intense carbonation, sharp' },
  { level: 9, description: 'Extra Strong - Powerful fizz, aggressive bubbles' },
  { level: 10, description: 'Maximum - Extreme carbonation, intense experience' },
].sort((a, b) => a.level - b.level) // Sort by level ascending

export function CarbonationSpectrum() {
  const [activeLevel, setActiveLevel] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      {/* Visual Spectrum */}
      <div className="relative">
        <div className="h-12 rounded-lg overflow-hidden flex">
          {carbonationLevels.map(({ level }) => (
            <button
              key={level}
              className={`flex-1 transition-colors hover:brightness-110 ${activeLevel === level ? 'ring-2 ring-primary ring-inset' : ''}`}
              style={{
                background: `hsl(200, ${Math.min(30 + level * 7, 100)}%, ${Math.max(85 - level * 4, 45)}%)`
              }}
              onClick={() => setActiveLevel(activeLevel === level ? null : level)}
            >
              <span className="sr-only">Level {level}</span>
            </button>
          ))}
        </div>

        {/* Level Numbers */}
        <div className="flex justify-between mt-2 px-[2%]">
          {carbonationLevels.map(({ level }) => (
            <div
              key={level}
              className={`text-sm font-medium transition-colors ${activeLevel === level ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {level}
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="h-12 flex items-center justify-center text-center">
        {activeLevel ? (
          <p className="text-sm text-muted-foreground animate-fade-in">
            {carbonationLevels.find(l => l.level === activeLevel)?.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click a level to see its description
          </p>
        )}
      </div>
    </div>
  )
} 