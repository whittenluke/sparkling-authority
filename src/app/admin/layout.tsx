'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Check if user is admin
  if (!user || user.email !== 'whittenluke@gmail.com') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 w-full">
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
                href="/admin/reviews"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/admin/content"
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                <span>Content</span>
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