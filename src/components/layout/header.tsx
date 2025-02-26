'use client'

import Link from 'next/link'
import { Home, Droplet, BookOpen, Star, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Brands', href: '/brands', icon: Droplet },
  { name: 'Guides', href: '/guides', icon: BookOpen },
  { name: 'Reviews', href: '/reviews', icon: Star },
]

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
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
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