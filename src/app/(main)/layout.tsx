import { Header } from '@/components/layout/header'
import { ContentWidthWrapper } from '@/components/layout/ContentWidthWrapper'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <ContentWidthWrapper>{children}</ContentWidthWrapper>
    </div>
  )
} 