import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, BookOpen, ArrowUpRight } from 'lucide-react'
import { DashboardLayout, C, AvatarCircle, avatarBg, useDarkMode } from '@/components/layouts/DashboardLayout'
import { MentorRequestDialog } from '@/components/mentorship/MentorRequestDialog'
import { useAuth } from '@/hooks/useAuth'
import { useMentors, useMyMentors, useOutgoingRequests } from '@/hooks/useMentorship'
import type { MentorProfile } from '@/hooks/useMentorship'

// ─── Eyebrow label ───────────────────────────────────────────────────────────
function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ color: C.orange, fontSize: 14, lineHeight: 1 }}>•</span>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.secondary }}>
        {label}
      </span>
    </div>
  )
}

// ─── Arrow button ────────────────────────────────────────────────────────────
function ArrowBtn({ size = 32, outlined = false, dark = false }: { size?: number; outlined?: boolean; dark?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: outlined ? 'transparent' : C.orange,
        border: outlined ? `1.5px solid ${dark ? '#444' : C.border}` : 'none',
        color: outlined ? (dark ? C.darkText : C.charcoal) : C.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'transform 0.15s',
        transform: hov ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <ArrowUpRight style={{ width: size * 0.45, height: size * 0.45 }} />
    </button>
  )
}

// ─── Photo placeholder ───────────────────────────────────────────────────────
function PhotoPlaceholder({ tint = 'warm', style: s }: { tint?: string; style?: React.CSSProperties }) {
  const gradients: Record<string, string> = {
    warm: 'linear-gradient(145deg, #B87040 0%, #D4935A 40%, #C08060 70%, #8B5030 100%)',
    cool: 'linear-gradient(145deg, #4A6A8A 0%, #6A8FAA 40%, #5A7A9A 70%, #3A5A7A 100%)',
    dark: 'linear-gradient(145deg, #2A2A2A 0%, #383838 40%, #282828 100%)',
  }
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...s }}>
      <div style={{ position: 'absolute', inset: 0, background: gradients[tint] ?? gradients.warm }} />
    </div>
  )
}

// ─── Tag pill ────────────────────────────────────────────────────────────────
function TagPill({ label, dark }: { label: string; dark: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 100,
      fontSize: 12, fontWeight: 500,
      background: 'transparent',
      color: dark ? '#888' : C.secondary,
      border: `1px solid ${dark ? '#333' : C.border}`,
    }}>
      {label}
    </span>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function StudentHero({
  dark, firstName, greeting, activeMentorships, pendingRequests,
}: {
  dark: boolean
  firstName: string
  greeting: string
  activeMentorships: number
  pendingRequests: number
}) {
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'visible', marginBottom: 24 }}>
      <div style={{ borderRadius: 24, overflow: 'hidden', height: 220, position: 'relative' }}>
        <PhotoPlaceholder tint={dark ? 'dark' : 'warm'} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }} />
        <div style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)' }}>
          <Eyebrow label="Your Journey" />
          <div style={{ fontSize: 38, fontWeight: 800, color: C.white, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            {greeting},<br />{firstName} ✦
          </div>
          {pendingRequests > 0 && (
            <div style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              You have {pendingRequests} pending request{pendingRequests !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Floating stat cards */}
      <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 12 }}>
        {[
          { label: 'Active Mentors', value: activeMentorships, color: C.mint, textColor: C.charcoal },
          { label: 'Pending', value: pendingRequests, color: C.orange, textColor: C.white },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.color, borderRadius: 20, padding: '14px 18px',
            textAlign: 'center', minWidth: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.textColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: stat.textColor, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mentor card ─────────────────────────────────────────────────────────────
function MentorCard({
  mentor, dark, hasRequest, onRequest,
}: {
  mentor: MentorProfile
  dark: boolean
  hasRequest: boolean
  onRequest: (m: MentorProfile) => void
}) {
  const [hov, setHov] = useState(false)
  const [requested, setRequested] = useState(false)
  const cardBg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 200, borderRadius: 20,
        background: cardBg,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: '18px 16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: avatarBg(mentor.user.full_name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.white, fontSize: 18, fontWeight: 700,
        }}>
          {mentor.user.full_name.charAt(0)}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, right: 36,
          width: 13, height: 13, borderRadius: '50%',
          background: C.mint,
          border: `2px solid ${cardBg}`,
        }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 2 }}>
        {mentor.user.full_name}
      </div>
      <div style={{ fontSize: 12, color: C.secondary, marginBottom: 2 }}>
        {mentor.bio ?? 'Mentor'}
      </div>
      <div style={{ fontSize: 12, color: C.tertiary, marginBottom: 12 }}>
        {mentor.user.university_name ?? ''}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {(mentor.expertise_areas ?? []).slice(0, 2).map((t: string) => <TagPill key={t} label={t} dark={dark} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#5A9A5A', fontWeight: 600 }}>● Available</span>
        <button
          onClick={() => {
            if (!hasRequest && !requested) {
              setRequested(true)
              onRequest(mentor)
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: (hasRequest || requested) ? C.mint : C.orange,
            color: (hasRequest || requested) ? C.charcoal : C.white,
            border: 'none',
            borderRadius: 100, padding: '6px 12px',
            fontSize: 12, fontWeight: 600,
            cursor: (hasRequest || requested) ? 'default' : 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            transition: 'background 0.2s',
          }}
        >
          {(hasRequest || requested) ? '✓ Sent' : 'Request ↗'}
        </button>
      </div>
    </div>
  )
}

// ─── My mentors strip ────────────────────────────────────────────────────────
function MyMentorsStrip({ mentors, dark }: { mentors: Array<{ id: string; mentor: { full_name: string; current_role?: string } }>, dark: boolean }) {
  const cardBg = dark ? '#1A1A1A' : C.white
  if (mentors.length === 0) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <Eyebrow label="My Mentors" />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {mentors.map(m => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: cardBg, borderRadius: 16,
            border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
            padding: '12px 16px', minWidth: 220, flexShrink: 0,
          }}>
            <AvatarCircle name={m.mentor.full_name} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>
                {m.mentor.full_name}
              </div>
              <div style={{ fontSize: 11, color: C.tertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.mentor.current_role ?? 'Mentor'}
              </div>
            </div>
            <Link to="/messages">
              <button style={{ background: 'none', border: `1px solid ${dark ? '#333' : C.border}`, borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare style={{ width: 13, height: 13, color: C.secondary }} />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature grid ────────────────────────────────────────────────────────────
function FeatureGrid({ dark }: { dark: boolean }) {
  const [hov, setHov] = useState<string | null>(null)
  const today = new Date()
  return (
    <div style={{ marginBottom: 24 }}>
      <Eyebrow label="Explore" />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '180px 150px', gap: 14 }}>
        {/* Browse Jobs — large, spans 2 rows */}
        <Link to="/careers" style={{ textDecoration: 'none', gridRow: '1 / 3' }}>
          <div
            onMouseEnter={() => setHov('jobs')}
            onMouseLeave={() => setHov(null)}
            style={{
              borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s', transform: hov === 'jobs' ? 'translateY(-4px)' : 'none',
            }}
          >
            <PhotoPlaceholder tint={dark ? 'dark' : 'warm'} style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 12 }}>
                Browse<br />Opportunities
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Open roles</span>
                <ArrowBtn size={32} />
              </div>
            </div>
          </div>
        </Link>

        {/* Community — mint */}
        <Link to="/community" style={{ textDecoration: 'none' }}>
          <div
            onMouseEnter={() => setHov('community')}
            onMouseLeave={() => setHov(null)}
            style={{
              borderRadius: 20, background: C.mint, padding: 20, cursor: 'pointer',
              transition: 'transform 0.2s', transform: hov === 'community' ? 'translateY(-4px)' : 'none',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4A7A40', marginBottom: 8 }}>
                Community
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.charcoal, lineHeight: 1.15 }}>
                Connect with peers
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.charcoal, lineHeight: 1 }}>1.2k</div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#4A7A40' }}>Posts this week</div>
              </div>
              <ArrowBtn size={30} />
            </div>
          </div>
        </Link>

        {/* Events */}
        <Link to="/events" style={{ textDecoration: 'none' }}>
          <div
            onMouseEnter={() => setHov('events')}
            onMouseLeave={() => setHov(null)}
            style={{
              borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer',
              transition: 'transform 0.2s', transform: hov === 'events' ? 'translateY(-4px)' : 'none',
              height: '100%',
            }}
          >
            <PhotoPlaceholder tint="cool" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, background: C.white, borderRadius: 12, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.orange, lineHeight: 1 }}>
                {today.getDate()}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: C.secondary, letterSpacing: '0.05em' }}>
                {today.toLocaleString('default', { month: 'short' })}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Events</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Upcoming</div>
            </div>
          </div>
        </Link>

        {/* Resources */}
        <Link to="/resources" style={{ textDecoration: 'none', gridColumn: '3' }}>
          <div
            onMouseEnter={() => setHov('resources')}
            onMouseLeave={() => setHov(null)}
            style={{
              borderRadius: 20, background: dark ? '#222' : '#F0EDE6',
              border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '16px 18px', cursor: 'pointer',
              transition: 'transform 0.2s', transform: hov === 'resources' ? 'translateY(-4px)' : 'none',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%',
            }}
          >
            <div>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: dark ? '#333' : C.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, border: `1px solid ${dark ? '#444' : C.border}`,
              }}>
                <BookOpen style={{ width: 18, height: 18, color: C.orange }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>Resources</div>
              <div style={{ fontSize: 12, color: C.tertiary, marginTop: 2 }}>Guides & Templates</div>
            </div>
            <ArrowBtn size={28} outlined dark={dark} />
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── Activity feed ───────────────────────────────────────────────────────────
function ActivityFeed({ dark, activeMentorships, pendingRequests }: {
  dark: boolean
  activeMentorships: Array<{ id: string; mentor: { full_name: string } }>
  pendingRequests: Array<{ id: string; mentor: { full_name: string } }>
}) {
  const cardBg = dark ? '#161616' : C.white

  const todayItems = [
    ...activeMentorships.slice(0, 2).map(m => ({
      name: m.mentor.full_name, action: 'is your active mentor', time: 'Active', positive: true,
    })),
    ...pendingRequests.slice(0, 2).map(r => ({
      name: r.mentor.full_name, action: 'request pending review', time: 'Pending', positive: false,
    })),
  ]

  const platformItems = [
    { name: 'ConnectUni', action: 'Welcome to your dashboard', time: 'Today', positive: true },
    { name: 'ConnectUni', action: 'Complete your profile for better matches', time: 'Tip', positive: false },
  ]

  const displayItems = todayItems.length > 0 ? todayItems : platformItems

  return (
    <div style={{ width: 280, flexShrink: 0, marginLeft: 20 }}>
      <div style={{
        background: cardBg, borderRadius: 20,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: '20px 18px', position: 'sticky', top: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Eyebrow label="Activity" />
          <Link to="/notifications" style={{ fontSize: 12, color: C.orange, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
            See all
          </Link>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.tertiary, marginBottom: 10 }}>
          Recent
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {displayItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0',
              borderBottom: `1px solid ${dark ? '#1E1E1E' : '#F5F3EF'}`,
              alignItems: 'flex-start',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <AvatarCircle name={item.name} size={32} />
                {item.positive && (
                  <div style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 12, height: 12, borderRadius: '50%',
                    background: C.mint, border: `1.5px solid ${cardBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                      <polyline points="2 5 4 7 8 3" stroke={C.charcoal} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: dark ? C.darkText : C.charcoal, lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>{' '}
                  <span style={{ color: C.secondary }}>{item.action}</span>
                </div>
                <div style={{ fontSize: 11, color: C.tertiary, marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Student Dashboard ───────────────────────────────────────────────────────
function StudentDashboardContent() {
  const { profile } = useAuth()
  const { dark } = useDarkMode()
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors()
  const { data: relationships = [] } = useMyMentors()
  const { data: outgoingRequests = [] } = useOutgoingRequests()
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeMentorships = relationships.filter((m) => m.status === 'ACTIVE')
  const pendingRequests = outgoingRequests.filter((r) => r.status === 'PENDING')
  const pendingMentorIds = new Set([
    ...activeMentorships.map((m) => m.mentor_id),
    ...pendingRequests.map((r) => r.mentor_id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <StudentDashboardInner
        dark={dark}
        firstName={firstName}
        greeting={greeting}
        activeMentorships={activeMentorships}
        pendingRequests={pendingRequests}
        mentors={mentors}
        mentorsLoading={mentorsLoading}
        pendingMentorIds={pendingMentorIds}
        onRequest={(m) => { setSelectedMentor(m); setDialogOpen(true) }}
      />
      <MentorRequestDialog
        mentor={selectedMentor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <StudentDashboardContent />
    </DashboardLayout>
  )
}

// Inner component that can consume DarkModeContext
function StudentDashboardInner({
  dark, firstName, greeting, activeMentorships, pendingRequests,
  mentors, mentorsLoading, pendingMentorIds, onRequest,
}: {
  dark: boolean
  firstName: string
  greeting: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeMentorships: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingRequests: any[]
  mentors: MentorProfile[]
  mentorsLoading: boolean
  pendingMentorIds: Set<number>
  onRequest: (m: MentorProfile) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <StudentHero
          dark={dark}
          firstName={firstName}
          greeting={greeting}
          activeMentorships={activeMentorships.length}
          pendingRequests={pendingRequests.length}
        />

        {/* Recommended Mentors */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Eyebrow label="Recommended Mentors" />
            <Link to="/mentorship" style={{ fontSize: 13, color: C.orange, fontWeight: 600, textDecoration: 'none' }}>
              See all →
            </Link>
          </div>
          {mentorsLoading ? (
            <div style={{ display: 'flex', gap: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ minWidth: 200, height: 200, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6', flexShrink: 0 }} />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div style={{
              borderRadius: 20, border: `1.5px dashed ${C.border}`,
              background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              padding: '40px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, color: C.secondary, marginBottom: 16 }}>No mentors available yet</div>
              <Link to="/mentorship">
                <button style={{
                  background: C.orange, color: C.white, border: 'none',
                  borderRadius: 100, padding: '10px 24px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}>
                  Browse Mentors
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {mentors.slice(0, 6).map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  dark={dark}
                  hasRequest={pendingMentorIds.has(mentor.user_id)}
                  onRequest={onRequest}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Mentors strip */}
        <MyMentorsStrip mentors={activeMentorships} dark={dark} />

        {/* Feature grid */}
        <FeatureGrid dark={dark} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed
        dark={dark}
        activeMentorships={activeMentorships}
        pendingRequests={pendingRequests}
      />
    </div>
  )
}
