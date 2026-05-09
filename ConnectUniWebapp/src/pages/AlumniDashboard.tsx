import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Calendar, Briefcase, Link as LinkIcon } from 'lucide-react'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useIncomingRequests, useMyMentees, useUpdateMentorshipStatus, useMentorshipStats } from '@/hooks/useMentorship'
import { useDashboardStats } from '@/hooks/useDashboard'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function PhotoPlaceholder({ style: s }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...s }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #B87040 0%, #D4935A 40%, #C08060 70%, #8B5030 100%)' }} />
    </div>
  )
}

function SegmentedProgress({ value, total, color = C.lavender }: { value: number; total: number; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < value ? color : '#F2F2F2' }} />
      ))}
    </div>
  )
}

function AlumniHero({ firstName, greeting, activeCount, pendingCount, totalSessions, unreadMessages }: {
  firstName: string; greeting: string; activeCount: number; pendingCount: number
  totalSessions: number; unreadMessages: number
}) {
  const stats = [
    { label: 'Active Mentees', value: activeCount,    bg: C.mint,   text: C.charcoal },
    { label: 'Pending',        value: pendingCount,   bg: C.orange, text: C.white },
    { label: 'Messages',       value: unreadMessages, bg: C.white,  text: C.charcoal },
    { label: 'Sessions',       value: totalSessions,  bg: C.white,  text: C.charcoal },
  ]
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', height: 200, marginBottom: 28 }}>
      <PhotoPlaceholder style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%)' }} />
      <div style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)' }}>
        <Eyebrow label="Your Impact" />
        <div style={{ fontSize: 38, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {greeting},<br />{firstName} ✦
        </div>
      </div>
      <div style={{ position: 'absolute', right: 24, bottom: 20, display: 'flex', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 16, padding: '12px 14px',
            textAlign: 'center', minWidth: 80, boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            border: s.bg === C.white ? '1px solid rgba(255,255,255,0.3)' : 'none',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.text, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: s.text, opacity: 0.75, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RequestCard({ mentorship, dark, onAccept, onDecline, isPending }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mentorship: any; dark: boolean
  onAccept: (id: number) => Promise<boolean>; onDecline: (id: number) => Promise<boolean>; isPending: boolean
}) {
  const [localStatus, setLocalStatus] = useState<'accepted' | 'declined' | null>(null)
  const [hov, setHov] = useState(false)
  const cardBg = dark ? '#1A1A1A' : C.white
  if (localStatus) {
    return (
      <div style={{
        minWidth: 300, borderRadius: 20, flexShrink: 0,
        background: localStatus === 'accepted' ? C.mint : (dark ? '#1A1A1A' : '#F5F5F5'),
        border: `1px solid ${localStatus === 'accepted' ? '#A8CC88' : (dark ? '#2A2A2A' : C.border)}`,
        padding: 20, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8, height: 210,
      }}>
        <div style={{ fontSize: 28 }}>{localStatus === 'accepted' ? '✓' : '✕'}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: localStatus === 'accepted' ? C.charcoal : (dark ? C.darkText : C.charcoal) }}>
          {localStatus === 'accepted' ? 'Request Accepted' : 'Request Declined'}
        </div>
        <button onClick={() => setLocalStatus(null)} style={{ fontSize: 12, color: C.secondary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Undo</button>
      </div>
    )
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 300, borderRadius: 20, flexShrink: 0,
        background: cardBg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.1)' : 'none',
      }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <AvatarCircle name={mentorship.mentee?.full_name ?? 'S'} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{mentorship.mentee?.full_name ?? 'Student'}</div>
          <div style={{ fontSize: 12, color: C.secondary }}>{mentorship.mentee?.university_name ?? 'University'}</div>
          {mentorship.goal && (
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: C.orange, color: C.white }}>{mentorship.goal}</span>
            </div>
          )}
        </div>
      </div>
      {mentorship.message && (
        <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
          "{mentorship.message}"
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button disabled={isPending} onClick={async () => { if (await onDecline(mentorship.id)) setLocalStatus('declined') }}
          style={{ flex: 1, padding: '9px', borderRadius: 100, background: 'transparent', border: `1.5px solid ${dark ? '#333' : C.border}`, fontSize: 13, fontWeight: 600, color: C.secondary, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Decline
        </button>
        <button disabled={isPending} onClick={async () => { if (await onAccept(mentorship.id)) setLocalStatus('accepted') }}
          style={{ flex: 1, padding: '9px', borderRadius: 100, background: C.orange, border: 'none', fontSize: 13, fontWeight: 600, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Accept ↗
        </button>
      </div>
    </div>
  )
}

function QuickActions({ dark }: { dark: boolean }) {
  const [hov, setHov] = useState<string | null>(null)
  const actions = [
    { key: 'resource', icon: LinkIcon,      label: 'Share Resource', sub: 'Articles, decks, links',    bg: C.mint,   iconColor: '#4A8A40', href: '/resources' },
    { key: 'event',   icon: Calendar,      label: 'Create Event',   sub: 'Webinar or workshop',       bg: dark ? '#1A1A1A' : C.white, iconColor: C.orange, href: '/events' },
    { key: 'job',     icon: Briefcase,     label: 'Post a Job',     sub: 'Open roles at your company', bg: C.orange, iconColor: C.white, href: '/careers' },
    { key: 'msg',     icon: MessageSquare, label: 'Messages',       sub: 'View conversations',         bg: dark ? '#1A1A1A' : C.white, iconColor: dark ? C.darkText : C.charcoal, href: '/messages' },
  ]
  return (
    <div>
      <Eyebrow label="Quick Actions" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {actions.map(a => {
          const IconComp = a.icon
          const isWhite = a.bg === C.white || a.bg === '#1A1A1A'
          return (
            <Link key={a.key} to={a.href} style={{ textDecoration: 'none' }}>
              <div onMouseEnter={() => setHov(a.key)} onMouseLeave={() => setHov(null)}
                style={{
                  background: a.bg, borderRadius: 20, padding: 20,
                  border: isWhite ? `1px solid ${dark ? '#2A2A2A' : C.border}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: hov === a.key ? 'translateY(-4px)' : 'none',
                  boxShadow: hov === a.key ? '0 12px 32px rgba(0,0,0,0.12)' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: isWhite ? (dark ? '#252525' : '#F5F3EF') : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp style={{ width: 20, height: 20, color: a.iconColor }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: a.bg === C.orange ? C.white : (dark ? C.darkText : C.charcoal) }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: a.bg === C.orange ? 'rgba(255,255,255,0.7)' : C.secondary, marginTop: 2 }}>{a.sub}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page content (inside DashboardLayout context) ───────────────────────────
function AlumniDashboardContent() {
  const { profile } = useAuth()
  const { dark } = useDarkMode()
  const { data: requests = [], isLoading: requestsLoading } = useIncomingRequests()
  const { data: mentees = [], isLoading: menteesLoading } = useMyMentees()
  const updateStatus = useUpdateMentorshipStatus()
  const { data: mentorshipStats } = useMentorshipStats()
  const { data: dashboardStats } = useDashboardStats()

  const pending = requests.filter((m) => m.status.toLowerCase() === 'pending')
  const active  = mentees.filter((m) => m.status.toLowerCase() === 'active')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const cardBg = dark ? '#1A1A1A' : C.white

  async function handleAccept(id: number): Promise<boolean> {
    try {
      await updateStatus.mutateAsync({ id, status: 'active' })
      toast.success('Mentorship accepted!')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to accept the mentorship request'))
      return false
    }
  }
  async function handleDecline(id: number): Promise<boolean> {
    try {
      await updateStatus.mutateAsync({ id, status: 'declined' })
      toast.success('Request declined')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to decline the mentorship request'))
      return false
    }
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <AlumniHero
          firstName={firstName}
          greeting={greeting}
          activeCount={active.length}
          pendingCount={pending.length}
          totalSessions={mentorshipStats?.as_mentor.total_sessions ?? 0}
          unreadMessages={dashboardStats?.messages_unread ?? 0}
        />

        {/* Pending Requests */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <Eyebrow label="Pending Requests" />
              <div style={{ fontSize: 13, color: C.secondary, marginTop: -4 }}>Students waiting for your response</div>
            </div>
            {pending.length > 0 && (
              <span style={{ background: C.orange, color: C.white, fontSize: 12, fontWeight: 700, borderRadius: 100, padding: '3px 10px' }}>{pending.length}</span>
            )}
          </div>
          {requestsLoading ? (
            <div style={{ display: 'flex', gap: 14 }}>
              {[0, 1].map(i => <div key={i} style={{ minWidth: 300, height: 210, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6', flexShrink: 0 }} />)}
            </div>
          ) : pending.length === 0 ? (
            <div style={{ borderRadius: 20, border: `1.5px dashed ${dark ? '#333' : C.border}`, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, color: C.secondary }}>No pending requests</div>
              <div style={{ fontSize: 13, color: C.tertiary, marginTop: 4 }}>New mentorship requests will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {pending.map(m => (
                <RequestCard key={m.id} mentorship={m} dark={dark} onAccept={handleAccept} onDecline={handleDecline} isPending={updateStatus.isPending} />
              ))}
            </div>
          )}
        </div>

        {/* Active Mentees */}
        <div style={{ marginBottom: 28 }}>
          <Eyebrow label="Active Mentees" />
          {menteesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map(i => <div key={i} style={{ height: 90, borderRadius: 18, background: dark ? '#1A1A1A' : '#F0EDE6' }} />)}
            </div>
          ) : active.length === 0 ? (
            <div style={{ borderRadius: 20, border: `1.5px dashed ${dark ? '#333' : C.border}`, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, color: C.secondary }}>No active mentees yet</div>
              <div style={{ fontSize: 13, color: C.tertiary, marginTop: 4 }}>Accept a request to get started</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.map(m => (
                <div key={m.id} style={{ background: cardBg, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <AvatarCircle name={m.mentee?.full_name ?? 'S'} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{m.mentee?.full_name ?? 'Student'}</div>
                      <div style={{ fontSize: 12, color: C.tertiary }}>{m.meeting_frequency ?? 'Regular'} sessions</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>{m.mentee?.university_name ?? 'University'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SegmentedProgress value={4} total={8} color={C.lavender} />
                      <span style={{ fontSize: 11, color: C.tertiary, fontWeight: 600, flexShrink: 0 }}>Active</span>
                    </div>
                  </div>
                  <Link to="/messages">
                    <button style={{ background: 'none', border: `1px solid ${dark ? '#333' : C.border}`, borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MessageSquare style={{ width: 15, height: 15, color: C.secondary }} />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <QuickActions dark={dark} />
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AlumniDashboard() {
  return (
    <DashboardLayout>
      <AlumniDashboardContent />
    </DashboardLayout>
  )
}
