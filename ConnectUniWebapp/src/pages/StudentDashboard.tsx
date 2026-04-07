import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Briefcase, ArrowRight, Globe, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { MentorCard } from '@/components/mentorship/MentorCard'
import { MentorRequestDialog } from '@/components/mentorship/MentorRequestDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useMentors, useMyMentors, useOutgoingRequests } from '@/hooks/useMentorship'
import type { MentorProfile } from '@/hooks/useMentorship'
import { getInitials, formatRelativeTime } from '@/lib/utils'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors()
  const { data: relationships = [], isLoading: relationshipsLoading } = useMyMentors()
  const { data: outgoingRequests = [] } = useOutgoingRequests()
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeMentorships = relationships.filter((m) => m.status === 'ACTIVE')
  const pendingRequests = outgoingRequests.filter((r) => r.status === 'PENDING')
  const pendingMentorIds = new Set([
    ...relationships.filter((m) => m.status === 'ACTIVE').map((m) => m.mentor_id),
    ...outgoingRequests.filter((r) => r.status === 'PENDING').map((r) => r.mentor_id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Active Mentors', value: activeMentorships.length, href: '/mentorship', colorClass: 'stat-gradient-purple', textColor: 'text-violet-300' },
    { label: 'Pending', value: pendingRequests.length, href: '/mentorship', colorClass: 'stat-gradient-indigo', textColor: 'text-indigo-300' },
    { label: 'Community', value: 0, href: '/community', colorClass: 'stat-gradient-blue', textColor: 'text-blue-300' },
    { label: 'Events', value: 0, href: '/events', colorClass: 'stat-gradient-emerald', textColor: 'text-emerald-300' },
  ]

  return (
    <DashboardLayout>
      <div className="relative min-h-full">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-64 overflow-hidden">
          <div className="absolute -top-20 left-1/4 h-64 w-96 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from) / 0.12), transparent 70%)' }}
          />
          <div className="absolute -top-10 right-1/4 h-48 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--gradient-to) / 0.08), transparent 70%)' }}
          />
        </div>

        <div className="relative p-6 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Student Portal</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {greeting},{' '}
                <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Here's what's happening on ConnectUni
              </p>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <Link key={stat.label} to={stat.href}>
                <div className={`${stat.colorClass} rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform duration-200`}>
                  <p className={`text-2xl font-bold tabular-nums ${stat.textColor}`}>{stat.value}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{stat.label}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* My Mentors */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">My Mentors</h2>
                <Link
                  to="/mentorship"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {relationshipsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : activeMentorships.length === 0 ? (
                <Card className="border-dashed border-border/40 bg-muted/20">
                  <CardContent className="p-5 text-center space-y-3">
                    <Users className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">No active mentors yet</p>
                    <Link to="/mentorship">
                      <Button size="sm" className="w-full h-8 text-xs gradient-primary border-0 text-white shadow-glow-sm">
                        Find a mentor
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                activeMentorships.map((m) => (
                  <div key={m.id} className="glass-card rounded-xl p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                        <AvatarFallback className="text-[10px] bg-accent text-accent-foreground font-semibold">
                          {getInitials(m.mentor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.mentor.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {m.meeting_frequency} · since {formatRelativeTime(m.started_at)}
                        </p>
                      </div>
                      <Badge className="text-[10px] h-5 px-1.5 shrink-0 gradient-primary border-0 text-white">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))
              )}

              {pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
                    Pending
                  </p>
                  {pendingRequests.map((r) => (
                    <div key={r.id} className="glass-card rounded-xl p-3 opacity-70">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-muted">
                            {getInitials(r.mentor.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{r.mentor.full_name}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0 border-border/50">
                          Sent
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended mentors */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Recommended Mentors</h2>
                <Link
                  to="/mentorship"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  See all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {mentorsLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-44 w-full rounded-xl" />
                  ))}
                </div>
              ) : mentors.length === 0 ? (
                <Card className="border-dashed border-border/40 bg-muted/20">
                  <CardContent className="p-8 text-center">
                    <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No mentors available right now.</p>
                    <Link to="/mentorship">
                      <Button variant="outline" className="mt-3 h-8 text-xs" size="sm">
                        Browse mentors
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {mentors.slice(0, 4).map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onRequest={(m) => { setSelectedMentor(m); setDialogOpen(true) }}
                      hasActiveRequest={pendingMentorIds.has(mentor.user_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick access</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Browse Jobs', href: '/careers', icon: Briefcase },
                { label: 'Community', href: '/community', icon: Globe },
                { label: 'Events', href: '/events', icon: Calendar },
                { label: 'Mentorship', href: '/mentorship', icon: Users },
              ].map((link) => (
                <Link key={link.href} to={link.href}>
                  <div className="glass-card rounded-xl p-3.5 flex items-center gap-2.5 cursor-pointer hover:border-primary/30 transition-colors group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary-subtle group-hover:shadow-glow-sm transition-all">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MentorRequestDialog
        mentor={selectedMentor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </DashboardLayout>
  )
}
