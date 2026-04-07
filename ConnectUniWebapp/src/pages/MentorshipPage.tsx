import { useState } from 'react'
import { Search, Users, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { MentorCard } from '@/components/mentorship/MentorCard'
import { MentorRequestDialog } from '@/components/mentorship/MentorRequestDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMentors, useOutgoingRequests } from '@/hooks/useMentorship'
import type { MentorProfile } from '@/hooks/useMentorship'

export default function MentorshipPage() {
  const [search, setSearch] = useState('')
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: mentors = [], isLoading } = useMentors()
  const { data: outgoingRequests = [] } = useOutgoingRequests()

  const pendingMentorIds = new Set(
    outgoingRequests
      .filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED')
      .map((r) => r.mentor_id)
  )

  const filtered = mentors.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.user.full_name.toLowerCase().includes(q) ||
      m.user.university_name.toLowerCase().includes(q) ||
      m.expertise_areas.some((e) => e.toLowerCase().includes(q))
    )
  })

  function handleRequest(mentor: MentorProfile) {
    setSelectedMentor(mentor)
    setDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-full">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-via) / 0.12), transparent 70%)' }}
        />

        <div className="relative p-6 space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Mentorship</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Find a Mentor</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect with alumni and professionals who can guide your career
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, university, or expertise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Results count */}
          {!isLoading && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full gradient-primary" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
                mentor{filtered.length !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ' available'}
              </p>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
                <Users className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">No mentors found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {search ? 'Try different keywords' : 'Check back soon'}
                </p>
              </div>
              {search && (
                <Button variant="outline" size="sm" className="h-8 text-xs border-border/50" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onRequest={handleRequest}
                  hasActiveRequest={pendingMentorIds.has(mentor.user_id)}
                />
              ))}
            </div>
          )}
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
