import { Users, Briefcase, BookOpen, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-6 max-w-5xl mx-auto">
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
              <ShieldCheck className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Users', icon: Users, colorClass: 'stat-gradient-purple', textColor: 'text-violet-300' },
            { label: 'Mentorships', icon: TrendingUp, colorClass: 'stat-gradient-indigo', textColor: 'text-indigo-300' },
            { label: 'Communities', icon: BookOpen, colorClass: 'stat-gradient-blue', textColor: 'text-blue-300' },
            { label: 'Events', icon: Briefcase, colorClass: 'stat-gradient-emerald', textColor: 'text-emerald-300' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.colorClass} rounded-xl p-4`}>
              <p className={`text-2xl font-bold tabular-nums ${stat.textColor}`}>—</p>
              <p className="text-xs text-foreground/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs">Verification</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Verification Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Admin management endpoints are not yet available in this API version.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Platform Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="mt-4">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Admin endpoints coming soon</p>
                <p className="text-xs text-muted-foreground/60">Verification management will be available in a future update</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">User management coming soon</p>
                <p className="text-xs text-muted-foreground/60">Manage users, roles, and permissions from here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
