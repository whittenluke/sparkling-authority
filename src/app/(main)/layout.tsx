import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
} 