import { Link } from 'react-router-dom'
import { Users, MessageSquare, CheckCircle, XCircle, Clock, Briefcase, Calendar, BookOpen, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useMentorships, useUpdateMentorshipStatus } from '@/hooks/useMentorship'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function AlumniDashboard() {
  const { profile } = useAuth()
  const { data: mentorships = [], isLoading } = useMentorships(profile?.user_id, 'mentor')
  const updateStatus = useUpdateMentorshipStatus()

  const pending = mentorships.filter((m) => m.status === 'pending')
  const active = mentorships.filter((m) => m.status === 'active')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  async function handleAccept(mentorshipId: string) {
    try {
      await updateStatus.mutateAsync({ id: mentorshipId, status: 'active' })
      toast.success('Mentorship accepted!')
    } catch {
      toast.error('Failed to accept mentorship')
    }
  }

  async function handleDecline(mentorshipId: string) {
    try {
      await updateStatus.mutateAsync({ id: mentorshipId, status: 'declined' })
      toast.success('Request declined')
    } catch {
      toast.error('Failed to decline request')
    }
  }

  const stats = [
    { label: 'Active Mentees', value: active.length, colorClass: 'stat-gradient-purple', textColor: 'text-violet-300' },
    { label: 'Pending Requests', value: pending.length, colorClass: 'stat-gradient-indigo', textColor: 'text-indigo-300' },
    { label: 'Messages', value: 0, colorClass: 'stat-gradient-blue', textColor: 'text-blue-300' },
    { label: 'Sessions', value: active.length * 2, colorClass: 'stat-gradient-emerald', textColor: 'text-emerald-300' },
  ]

  return (
    <DashboardLayout>
      <div className="relative min-h-full">
        {/* Ambient background */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-64 overflow-hidden">
          <div className="absolute -top-20 left-1/4 h-64 w-96 rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from) / 0.10), transparent 70%)' }}
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
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Alumni Portal</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {greeting},{' '}
                <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your mentees and share your expertise
              </p>
            </div>
          </div>

          {/* Gradient stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${stat.colorClass} rounded-xl p-4`}>
                <p className={`text-2xl font-bold tabular-nums ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-foreground/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending requests */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Pending Requests</h2>
                {pending.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full gradient-primary px-1.5 text-[9px] font-bold text-white shadow-glow-sm">
                    {pending.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              ) : pending.length === 0 ? (
                <Card className="border-dashed border-border/40 bg-muted/20">
                  <CardContent className="p-6 text-center space-y-1.5">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                pending.map((m) => (
                  <div key={m.id} className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-primary/20">
                        <AvatarImage src={m.mentee?.avatar_url} />
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground font-semibold">
                          {getInitials(m.mentee?.full_name ?? 'S')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{m.mentee?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{m.mentee?.university ?? 'Student'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {formatRelativeTime(m.created_at)}
                      </span>
                    </div>
                    {m.goals && m.goals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.goals.slice(0, 3).map((g) => (
                          <Badge key={g} variant="secondary" className="text-[10px] h-5 px-1.5 capitalize bg-muted/60">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {m.intro_message && (
                      <p className="text-xs text-muted-foreground/70 line-clamp-2 bg-muted/40 rounded-lg p-2.5 border border-border/30 italic">
                        "{m.intro_message}"
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
                        onClick={() => handleAccept(m.id)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={() => handleDecline(m.id)}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Active mentees */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Active Mentees</h2>

              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : active.length === 0 ? (
                <Card className="border-dashed border-border/40 bg-muted/20">
                  <CardContent className="p-6 text-center space-y-1.5">
                    <Users className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">No active mentees yet</p>
                    <p className="text-xs text-muted-foreground/60">Accept a request to get started</p>
                  </CardContent>
                </Card>
              ) : (
                active.map((m) => (
                  <div key={m.id} className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-emerald-500/20">
                        <AvatarImage src={m.mentee?.avatar_url} />
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground font-semibold">
                          {getInitials(m.mentee?.full_name ?? 'S')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{m.mentee?.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {m.frequency} sessions · since {formatRelativeTime(m.created_at)}
                        </p>
                      </div>
                      <Badge className="text-[10px] h-5 px-1.5 shrink-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>2 sessions completed</span>
                      <Link to="/messages" className="text-primary hover:text-primary/80 transition-colors font-medium">
                        Message →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Share Resource', href: '/resources', icon: BookOpen },
                { label: 'Create Event', href: '/events', icon: Calendar },
                { label: 'Post a Job', href: '/careers', icon: Briefcase },
                { label: 'Messages', href: '/messages', icon: MessageSquare },
              ].map((action) => (
                <Link key={action.href} to={action.href}>
                  <div className="glass-card rounded-xl p-3.5 flex items-center gap-2.5 cursor-pointer hover:border-primary/30 transition-colors group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary-subtle group-hover:shadow-glow-sm transition-all">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
