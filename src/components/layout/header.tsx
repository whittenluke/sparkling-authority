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
      className="relative h-10 w-10 rounded-md text-primary hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
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
          className="inline-flex items-center text-lg font-clash-display font-medium text-primary hover:text-primary/90 dark:text-gray-100 dark:hover:text-blue-400"
        >
          {section}
        </Link>
      ) : (
        <button
          className="inline-flex items-center text-lg font-clash-display font-medium text-primary hover:text-primary/90 dark:text-gray-100 dark:hover:text-blue-400"
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
                  className="block px-4 py-2 text-base font-clash-display text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
        className="flex items-center space-x-2 text-primary hover:text-primary/90 dark:text-gray-300 dark:hover:text-blue-400"
      >
        <User className="h-6 w-6" />
        <span className="text-sm">{user.email?.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
          <div className="py-1">
            <Link
              href="/profile"
              className="flex w-full items-center px-4 py-2 text-sm text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            {isAdminUser && (
              <Link
                href="/admin"
                className="flex w-full items-center px-4 py-2 text-sm text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
              className="flex w-full items-center px-4 py-2 text-sm text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    async function checkAdminStatus() {
      if (user?.email) {
        const adminStatus = await isAdmin(user.email)
        setIsAdminUser(adminStatus)
      }
    }
    checkAdminStatus()
  }, [user?.email])

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 bg-white dark:bg-gray-900' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative h-full w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Menu content */}
        <div className="h-full pt-20 pb-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* User section */}
          {user ? (
            <div className="mb-8 p-4 rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.email?.split('@')[0]}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    onClick={onClose}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    onClose()
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                onClick={onClose}
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Navigation sections */}
          <div className="space-y-6">
            {Object.entries(navigation).map(([key, section]) => (
              <div key={key} className="space-y-3">
                <h3 className="px-3 text-xl font-clash-display font-medium text-primary">
                  {section.name}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 rounded-md text-base text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const { theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-transparent">
      <nav className="flex min-h-[80px]">
        <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={theme === 'dark' ? '/images/logos/logo-dark.png' : '/images/logos/logo-light.png'}
                alt="Sparkling Authority"
                width={500}
                height={110}
                className="h-12 w-auto"
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
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </nav>
    </header>
  )
} 