import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default async function HealthiestOptionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Healthiest Sparkling Waters</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                The most health-conscious sparkling water options, rated by ingredients and nutritional value.
              </p>
            </div>
            
            {/* Content will go here */}
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 