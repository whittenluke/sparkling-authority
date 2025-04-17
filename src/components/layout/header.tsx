'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Menu, Moon, Sun, User, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/supabase/admin'

const navigation = {
  explore: {
    name: 'Explore',
    items: [
      { name: 'All Brands', href: '/explore/brands' },
      { name: 'By Flavor', href: '/explore/flavors' },
      { name: 'By Carbonation Level', href: '/explore/carbonation' },
      { name: 'New Releases', href: '/explore/new-releases' },
      { name: 'Regional Favorites', href: '/explore/regional' },
      { name: 'Product Directory', href: '/explore/products' },
    ],
  },
  ratings: {
    name: 'Top Rated',
    items: [
      { name: 'Best Overall', href: '/ratings/best-overall' },
      { name: 'Best Flavor', href: '/ratings/best-flavor' },
      { name: 'Strongest Carbonation', href: '/ratings/strongest-carbonation' },
      { name: 'Best Value', href: '/ratings/best-value' },
      { name: 'Healthiest Options', href: '/ratings/healthiest-options' },
    ],
  },
  learn: {
    name: 'Learn',
    items: [
      { name: 'Health Guide', href: '/learn/health' },
      { name: 'Carbonation Explained', href: '/learn/carbonation' },
      { name: 'How to Make Sparkling Water', href: '/learn/how-to-make-sparkling-water' },
      { name: 'Buying Guide', href: '/learn/buying' },
      { name: 'Terminology', href: '/learn/terms' },
    ],
  },
  community: {
    name: 'Community',
    items: [
      { name: 'Submit a Review', href: '/community/reviews/submit' },
      { name: 'Submit a Product', href: '/community/products/submit' },
      { name: 'Featured Reviews', href: '/community/reviews/featured' },
      { name: 'Sparkling Water News', href: '/community/news' },
    ],
  },
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative h-10 w-10 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <div className="relative h-full w-full">
        <Sun className="absolute inset-0 h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 p-2" />
        <Moon className="absolute inset-0 h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 p-2" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

function NavDropdown({ section, items }: { section: string; items: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="relative h-full flex items-center" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      {section === 'Explore' ? (
        <Link
          href="/explore/products"
          className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
        >
          {section}
        </Link>
      ) : (
        <button
          className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {section}
        </button>
      )}

      {isOpen && (
        <>
          {/* Invisible area to ensure smooth mouse movement */}
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-transparent" />
          <div className="absolute left-0 top-[calc(100%-2px)] w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
            <div className="py-1">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function UserMenu({ user, signOut }: { user: SupabaseUser | null; signOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    async function checkAdminStatus() {
      if (user?.email) {
        const adminStatus = await isAdmin(user.email)
        setIsAdminUser(adminStatus)
      }
    }
    checkAdminStatus()
  }, [user?.email])

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
      >
        <User className="h-6 w-6" />
        <span className="text-sm">{user.email?.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
          <div className="py-1">
            <Link
              href="/profile"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            {isAdminUser && (
              <Link
                href="/admin"
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const { theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background">
      <nav className="flex min-h-[80px]">
        <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
                alt="Sparkling Authority"
                width={500}
                height={110}
                className="h-16 w-auto"
                priority
              />
              <span className="sr-only">SparklingAuthority</span>
            </Link>
            
            <div className="hidden sm:ml-12 sm:flex sm:space-x-10">
              {Object.entries(navigation).map(([key, section]) => (
                <NavDropdown key={key} section={section.name} items={section.items} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden sm:flex sm:items-center">
              {user ? (
                <UserMenu user={user} signOut={signOut} />
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-4 pb-3 pt-2">
              {Object.entries(navigation).map(([key, section]) => (
                <div key={key} className="px-3">
                  <div className="text-base font-medium text-foreground mb-2">
                    {section.name}
                  </div>
                  <div className="space-y-1 pl-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-base text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pb-3 pt-4">
              {user ? (
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full px-3 py-2 text-base font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 