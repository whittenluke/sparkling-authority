export const dynamic = 'force-dynamic'

import { ComingSoonMessage } from '@/components/ComingSoonMessage'

export default async function HealthiestOptionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Healthiest Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The most health-conscious sparkling water options, rated by ingredients and nutritional value.
        </p>
      </div>
      
      <ComingSoonMessage 
        title="Our health rankings are coming soon! We&apos;re analyzing nutritional data and gathering expert insights to create comprehensive rankings."
        description="learn more about the health benefits of different sparkling waters."
      />
    </div>
  )
} 