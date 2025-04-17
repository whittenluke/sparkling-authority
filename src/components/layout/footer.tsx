'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'

export function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <Image
                src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
                alt="Sparkling Authority"
                width={500}
                height={110}
                className="h-12 w-auto"
                priority
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your Definitive Guide to Sparkling Water
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Explore</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/explore/brands" className="text-sm text-muted-foreground hover:text-foreground">
                      Brands
                    </Link>
                  </li>
                  <li>
                    <Link href="/explore/products" className="text-sm text-muted-foreground hover:text-foreground">
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/explore/flavors" className="text-sm text-muted-foreground hover:text-foreground">
                      Flavors
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Sparkling Authority. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 