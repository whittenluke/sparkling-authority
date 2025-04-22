export const dynamic = 'force-dynamic'

import { ComingSoonMessage } from '@/components/ComingSoonMessage'

export default async function StrongestCarbonationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Strongest Carbonation</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The most intensely carbonated sparkling waters, ranked by bubble strength and effervescence.
        </p>
      </div>
      
      <ComingSoonMessage 
        title="Our carbonation rankings are coming soon! We're gathering community feedback to create comprehensive rankings."
        description="start rating your favorite highly carbonated waters."
      />
    </div>
  )
} 