import '@/styles/auth.css'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MessageSquare, Video, MapPin, GraduationCap, Users2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useSetMentorshipPreferences, useFullProfile, getDashboardForRole } from '@/hooks/useOnboarding'
import { useEnsureMentorProfile } from '@/hooks/useMentorship'
import { getErrorMessage } from '@/lib/api'

const AREAS_OF_INTEREST = [
  'CV writing', 'Interview prep', 'Software development', 'Career change',
  'Networking', 'Leadership', 'Research', 'Industry insight',
  'Entrepreneurship', 'Work-life balance', 'Graduate schemes', 'Job searching',
]

const MENTORSHIP_ROLES = [
  { label: "I want to\nmentor", is_mentor: true, is_mentee: false, Icon: GraduationCap },
  { label: "I want a\nmentor", is_mentor: false, is_mentee: true, Icon: Users2 },
  { label: "I'm open\nto both", is_mentor: true, is_mentee: true, Icon: BookOpen },
] as const

const FORMAT_OPTIONS = [
  { value: 'chat', label: 'Chat', Icon: MessageSquare },
  { value: 'video', label: 'Video', Icon: Video },
  { value: 'in_person', label: 'In-person', Icon: MapPin },
]

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

export default function MentorshipPrefsPage() {
  const navigate = useNavigate()
  const { data: profile } = useFullProfile()
  const mutation = useSetMentorshipPreferences()
  const ensureMentorProfile = useEnsureMentorProfile()

  const [mentorshipRoleIdx, setMentorshipRoleIdx] = useState<number | null>(null)
  const [areas, setAreas] = useState<string[]>([])
  const [hoursPerWeek, setHoursPerWeek] = useState(2)
  const [preferredFormat, setPreferredFormat] = useState<string | null>(null)

  function toggleArea(area: string) {
    setAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area])
  }

  const isValid = mentorshipRoleIdx !== null && areas.length > 0 && preferredFormat !== null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) { toast.error('Please complete all fields'); return }

    const selectedRole = MENTORSHIP_ROLES[mentorshipRoleIdx!]
    try {
      await mutation.mutateAsync({
        is_mentor: selectedRole.is_mentor,
        is_mentee: selectedRole.is_mentee,
        areas_of_interest: areas,
        availability_hours_per_week: hoursPerWeek,
        preferred_format: preferredFormat!,
      })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save preferences'))
      return
    }

    if (selectedRole.is_mentor) {
      try {
        await ensureMentorProfile.mutateAsync({
          expertise_areas: areas,
          mentorship_goals: [],
        })
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            'Your preferences were saved, but we could not finish creating your mentor profile.',
          ),
        )
        return
      }
    }

    toast.success('Preferences saved — welcome to ConnectUni!')
    const dashboard = profile ? getDashboardForRole(profile.role) : '/dashboard'
    navigate(dashboard, { replace: true })
  }

  // Slider bubble position (1–20 range → 0–100%)
  const bubbleLeft = `${((hoursPerWeek - 1) / 19) * 100}%`

  return (
    <div className="au-screen">
      {/* ── Form column (scrollable for dense content) ── */}
      <div className="au-col-form">
        <div className="au-form-header">
          <Link to="/" className="au-brand">
            <span className="au-logo-mark" />
            ConnectUni
          </Link>
          <div className="au-progress-pill">
            <div className="au-pp-seg">
              <span className="s on" /><span className="s on" />
            </div>
            Step 2 of 2
          </div>
        </div>

        <div className="au-form-body" style={{ maxWidth: 560 }}>
          <span className="au-eyebrow">Mentorship preferences</span>
          <h1 className="au-display">What does<br />good look like?</h1>
          <p className="au-sub">These settings power your match recommendations — you can retune anytime.</p>

          <form onSubmit={handleSubmit}>
            {/* ── Goal ── */}
            <div className="au-field">
              <label>Your goal</label>
              <div className="au-goals">
                {MENTORSHIP_ROLES.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`au-goal-pill${mentorshipRoleIdx === i ? ' selected' : ''}`}
                    onClick={() => setMentorshipRoleIdx(i)}
                  >
                    <div className="au-gp-ico">
                      <r.Icon size={18} />
                    </div>
                    <div className="au-gp-title" style={{ whiteSpace: 'pre-line' }}>
                      {r.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Interests ── */}
            <div className="au-field">
              <label>
                Interests{' '}
                <span style={{ textTransform: 'none', fontWeight: 500, color: '#9A9A9A', letterSpacing: 0 }}>
                  · pick as many as you like
                </span>
              </label>
              <div className="au-chips">
                {AREAS_OF_INTEREST.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`au-chip${areas.includes(area) ? ' selected' : ''}`}
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Availability slider ── */}
            <div className="au-field">
              <label>Availability per week</label>
              <div className="au-slider-wrap">
                <div className="au-slider-bubble" style={{ left: bubbleLeft }}>
                  {hoursPerWeek} hrs / wk
                </div>
                <input
                  type="range"
                  className="au-slider-input"
                  min={1}
                  max={20}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                />
              </div>
              <div className="au-slider-labels">
                <span>1 HR</span>
                <span>5 HR</span>
                <span>10 HR</span>
                <span>15 HR</span>
                <span>20 HR</span>
              </div>
            </div>

            {/* ── Format ── */}
            <div className="au-field">
              <label>Preferred format</label>
              <div className="au-formats-grid">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`au-format-card${preferredFormat === f.value ? ' selected' : ''}`}
                    onClick={() => setPreferredFormat(f.value)}
                  >
                    <div className="au-fc-illust">
                      <f.Icon size={24} />
                    </div>
                    <div className="au-fc-title">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="au-cta-row">
              <button
                type="button"
                className="au-btn au-btn-ghost"
                onClick={() => navigate('/onboarding/profile')}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="au-btn"
                style={{ flex: 1 }}
                disabled={mutation.isPending || ensureMentorProfile.isPending || !isValid}
              >
                {mutation.isPending || ensureMentorProfile.isPending ? 'Saving…' : 'Finish — take me in'}
                <span className="au-arrow-circle"><ArrowUpRight /></span>
              </button>
            </div>

            <p className="au-hint" style={{ marginTop: 14 }}>
              You'll see your first 5 mentor matches on the other side.
            </p>
          </form>
        </div>

        <div className="au-form-footer">
          <span>Preferences can be changed anytime</span>
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column ── */}
      <div className="au-col-photo alt-3">
        <div className="au-quote-float">
          <div className="au-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
            ))}
          </div>
          <blockquote>"Setting my interests took two minutes. My first match was in the exact niche I wanted — sustainability in tech."</blockquote>
          <div className="au-qfoot">
            <div className="au-av av-3" />
            <div>
              <div className="au-qfoot-name">Sofia Marchetti</div>
              <div className="au-qfoot-role">MSc Environmental Engineering · Imperial College</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
