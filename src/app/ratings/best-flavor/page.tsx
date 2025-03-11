import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const dynamic = 'force-dynamic'

export default async function BestFlavorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Best Flavored Sparkling Waters</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                The most delicious and authentic flavored sparkling waters, rated by taste and aroma.
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