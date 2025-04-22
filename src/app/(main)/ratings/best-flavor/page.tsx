export const dynamic = 'force-dynamic'

import { ComingSoonMessage } from '@/components/ComingSoonMessage'

export default async function BestFlavorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Best Flavored Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The most delicious and authentic flavored sparkling waters, rated by taste and aroma.
        </p>
      </div>
      
      <ComingSoonMessage 
        title="Our flavor ratings are coming soon! We&apos;re gathering community feedback to create comprehensive rankings."
        description="start rating your favorite flavored sparkling waters."
      />
    </div>
  )
} 