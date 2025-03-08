'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useState } from 'react'

const navigation = {
  explore: {
    name: 'Explore',
    items: [
      { name: 'All Brands', href: '/explore/brands' },
      { name: 'New Releases', href: '/explore/new' },
      { name: 'By Flavor', href: '/explore/flavors' },
      { name: 'By Carbonation Level', href: '/explore/carbonation' },
      { name: 'Regional Favorites', href: '/explore/regional' },
      { name: 'Product Directory', href: '/explore/directory' },
    ],
  },
  rankings: {
    name: 'Rankings',
    items: [
      { name: 'Best Overall', href: '/rankings/overall' },
      { name: 'Best Flavor', href: '/rankings/flavor' },
      { name: 'Strongest Carbonation', href: '/rankings/carbonation' },
      { name: 'Best Value', href: '/rankings/value' },
      { name: 'Healthiest Options', href: '/rankings/health' },
      { name: "Editor's Picks", href: '/rankings/editors' },
      { name: 'User Favorites', href: '/rankings/users' },
    ],
  },
  resources: {
    name: 'Resources',
    items: [
      { name: 'Health Guide', href: '/resources/health' },
      { name: 'Carbonation Explained', href: '/resources/carbonation' },
      { name: 'Making Your Own', href: '/resources/diy' },
      { name: 'Nutrition Facts', href: '/resources/nutrition' },
      { name: 'Buying Guide', href: '/resources/buying' },
      { name: 'Terminology', href: '/resources/terms' },
      { name: 'FAQ', href: '/resources/faq' },
    ],
  },
  community: {
    name: 'Community',
    items: [
      { name: 'Discussion Forum', href: '/community/forum' },
      { name: 'Submit a Review', href: '/community/review' },
      { name: 'User Rankings', href: '/community/rankings' },
      { name: 'Events & Meetups', href: '/community/events' },
      { name: 'Submit a Product', href: '/community/submit' },
      { name: 'Sparkling Water News', href: '/community/news' },
    ],
  },
}

function NavDropdown({ section, items }: { section: string; items: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative h-full flex items-center" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {section}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
      >
        <User className="h-6 w-6" />
        <span className="text-sm">{user.email?.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">SparklingAuthority</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {Object.entries(navigation).map(([key, section]) => (
                <NavDropdown key={key} section={section.name} items={section.items} />
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 