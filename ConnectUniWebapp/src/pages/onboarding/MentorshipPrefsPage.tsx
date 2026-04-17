import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSetMentorshipPreferences, useFullProfile, getDashboardForRole } from '@/hooks/useOnboarding'

// ─── Static options ───────────────────────────────────────────────────────────

const AREAS_OF_INTEREST = [
  'CV writing',
  'Interview prep',
  'Software development',
  'Career change',
  'Networking',
  'Leadership',
  'Research',
  'Industry insight',
  'Entrepreneurship',
  'Work-life balance',
  'Graduate schemes',
  'Job searching',
]

const MENTORSHIP_ROLES = [
  { label: 'I want to mentor', is_mentor: true, is_mentee: false },
  { label: 'I want a mentor', is_mentor: false, is_mentee: true },
  { label: 'Both', is_mentor: true, is_mentee: true },
] as const

// Backend accepts a single PreferredFormat value: "chat" | "video" | "in_person"
const FORMAT_OPTIONS = [
  { value: 'chat', label: 'Chat / messaging' },
  { value: 'video', label: 'Video call' },
  { value: 'in_person', label: 'In-person' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MentorshipPrefsPage() {
  const navigate = useNavigate()
  const { data: profile } = useFullProfile()
  const mutation = useSetMentorshipPreferences()

  const [mentorshipRoleIdx, setMentorshipRoleIdx] = useState<number | null>(null)
  const [areas, setAreas] = useState<string[]>([])
  const [hoursPerWeek, setHoursPerWeek] = useState(2)
  const [preferredFormat, setPreferredFormat] = useState<string | null>(null)

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const isValid = mentorshipRoleIdx !== null && areas.length > 0 && preferredFormat !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) { toast.error('Please complete all fields'); return }

    const selectedRole = MENTORSHIP_ROLES[mentorshipRoleIdx!]
    mutation.mutate(
      {
        is_mentor: selectedRole.is_mentor,
        is_mentee: selectedRole.is_mentee,
        areas_of_interest: areas,
        availability_hours_per_week: hoursPerWeek,
        preferred_format: preferredFormat!,
      },
      {
        onSuccess: () => {
          toast.success('Preferences saved — welcome to ConnectUni!')
          const dashboard = profile ? getDashboardForRole(profile.role) : '/dashboard'
          navigate(dashboard, { replace: true })
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save preferences'),
      }
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[360px] flex-col relative overflow-hidden shrink-0">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex flex-col h-full px-10 py-10 justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/25">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white/90 tracking-tight">ConnectUni</span>
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1">
              <span className="text-xs text-white/80 font-medium">Step 3 of 3 — Mentorship</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
              How do you want<br />to connect?
            </h2>
            <p className="text-sm text-white/55 leading-relaxed">
              These preferences help us match you with the right people on the platform.
            </p>
          </div>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} ConnectUni</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[480px] space-y-7">
          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold gradient-text">ConnectUni</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mentorship preferences</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Almost done — tell us how you'd like to engage with the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* ── Mentorship goal ── */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground/80">What's your mentorship goal?</p>
              <div className="grid grid-cols-3 gap-2">
                {MENTORSHIP_ROLES.map((r, i) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setMentorshipRoleIdx(i)}
                    className={cn(
                      'rounded-xl border p-3 text-center text-xs font-medium transition-all duration-200',
                      mentorshipRoleIdx === i
                        ? 'border-primary/40 bg-accent shadow-glow-sm text-foreground'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/30'
                    )}
                  >
                    {mentorshipRoleIdx === i && (
                      <div className="flex justify-center mb-1">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Areas of interest ── */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground/80">
                Areas of interest{' '}
                <span className="text-muted-foreground font-normal">(select all that apply)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {AREAS_OF_INTEREST.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
                      areas.includes(area)
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-border'
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {areas.length === 0 && (
                <p className="text-xs text-muted-foreground/60">Select at least one area</p>
              )}
            </div>

            {/* ── Availability ── */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground/80">
                Availability:{' '}
                <span className="text-primary">
                  {hoursPerWeek} hr{hoursPerWeek !== 1 ? 's' : ''} / week
                </span>
              </p>
              <input
                type="range"
                min={1}
                max={20}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground/60">
                <span>1 hr</span>
                <span>10 hrs</span>
                <span>20 hrs</span>
              </div>
            </div>

            {/* ── Preferred format ── */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground/80">Preferred format</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setPreferredFormat(f.value)}
                    className={cn(
                      'rounded-xl border p-3 text-center text-xs font-medium transition-all duration-200',
                      preferredFormat === f.value
                        ? 'border-primary/40 bg-accent shadow-glow-sm text-foreground'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/30'
                    )}
                  >
                    {preferredFormat === f.value && (
                      <div className="flex justify-center mb-1">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending || !isValid}
              className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                'Complete setup'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
