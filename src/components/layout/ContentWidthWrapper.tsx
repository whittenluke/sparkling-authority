'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

const EDITORIAL_PATHS = ['/terms', '/privacy', '/affiliate-disclosure'] as const

function isEditorialPath(pathname: string): boolean {
  if (pathname.startsWith('/learn')) return true
  return EDITORIAL_PATHS.includes(pathname as (typeof EDITORIAL_PATHS)[number])
}

export function ContentWidthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const contentMaxWidth = isEditorialPath(pathname ?? '') ? 'max-w-2xl' : 'max-w-5xl'

  return (
    <>
      <main className="flex-1">
        <div className={`mx-auto ${contentMaxWidth} px-4 sm:px-6 lg:px-8 py-8`}>
          {children}
        </div>
      </main>
      <Footer contentMaxWidth={contentMaxWidth} />
    </>
  )
}
