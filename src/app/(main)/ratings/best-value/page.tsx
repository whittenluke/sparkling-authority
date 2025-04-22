export const dynamic = 'force-dynamic'

import { ComingSoonMessage } from '@/components/ComingSoonMessage'

export default async function BestValuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Best Value Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          Top-rated sparkling waters that offer the best quality for your money.
        </p>
      </div>
      
      <ComingSoonMessage 
        title="Our value rankings are coming soon! We're gathering pricing data and community feedback to create comprehensive rankings."
        description="start rating your favorite budget-friendly options."
      />
    </div>
  )
} 