'use client'

import { Header } from '@/components/layout/header'
import { useAuth } from '@/lib/supabase/auth-context'
import { isAdmin } from '@/lib/supabase/admin'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Users, Settings, Package } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      if (!user?.email) {
        router.push('/')
        return
      }

      const adminStatus = await isAdmin(user.email)
      if (!adminStatus) {
        router.push('/')
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAdmin()
  }, [user?.email, router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return null // Or a loading spinner
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`sticky top-0 z-50 w-full transition-transform duration-300 ${isScrolled ? '-translate-y-full' : ''}`}>
        <Header />
      </div>
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card">
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-1 p-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/brands-products"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Package className="h-4 w-4" />
                <span>Brands & Products</span>
              </Link>
              <Link
                href="/admin/reviews"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reviews</span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
