'use client'

import { MessageSquare, FileText, Users, Flag } from 'lucide-react'

export default function AdminDashboard() {
  // TODO: Fetch real data
  const stats = [
    { name: 'Pending Reviews', value: '12', icon: MessageSquare, href: '/admin/reviews' },
    { name: 'Draft Articles', value: '3', icon: FileText, href: '/admin/content' },
    { name: 'New Users', value: '5', icon: Users, href: '/admin/users' },
    { name: 'Flagged Content', value: '2', icon: Flag, href: '/admin/reviews' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reviews */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Reviews</h2>
        <div className="mt-4 space-y-4">
          {/* Placeholder for recent reviews */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">No recent reviews to display</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="mt-4 space-y-4">
          {/* Placeholder for recent activity */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  )
} 