import { useState } from 'react'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useMentors, useOutgoingRequests, useSendMentorshipRequest, useIncomingRequests, useMyMentees, useAcceptRequest, useRejectRequest } from '@/hooks/useMentorship'
import type { MentorProfile } from '@/hooks/useMentorship'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'

const PER_PAGE = 6

function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ color: C.orange, fontSize: 14, lineHeight: 1 }}>•</span>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: C.secondary }}>{label}</span>
    </div>
  )
}

function TagPill({ label, active = false, dark = false }: { label: string; active?: boolean; dark?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100,
      fontSize: 12, fontWeight: 500,
      background: active ? C.orange : 'transparent',
      color: active ? C.white : (dark ? '#888' : C.secondary),
      border: `1px solid ${active ? C.orange : (dark ? '#333' : C.border)}`,
    }}>{label}</span>
  )
}

function VerifiedBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: C.mint, borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#3A6A30' }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="2 5 4 7 8 3" stroke="#3A6A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Verified
    </span>
  )
}

function PhotoPlaceholder({ s }: { s?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...s }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #B87040 0%, #D4935A 40%, #C08060 70%, #8B5030 100%)' }} />
    </div>
  )
}

// ─── Mentor Grid Card ─────────────────────────────────────────────────────────
function MentorGridCard({ mentor, dark, hasRequest, onSelect }: {
  mentor: MentorProfile; dark: boolean; hasRequest: boolean; onSelect: (m: MentorProfile) => void
}) {
  const [hov, setHov] = useState(false)
  const [requested, setRequested] = useState(false)
  const bg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(mentor)}
      style={{
        borderRadius: 22, background: bg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ height: 160, position: 'relative' }}>
        <PhotoPlaceholder s={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', top: 12, right: 12 }}><VerifiedBadge /></div>
        <div style={{ position: 'absolute', bottom: 10, left: 12, width: 11, height: 11, borderRadius: '50%', background: mentor.is_active ? '#6ABF6A' : '#E8B84A', border: '2px solid white' }} />
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 2 }}>{mentor.user.full_name}</div>
        <div style={{ fontSize: 13, color: C.secondary, marginBottom: 1 }}>{mentor.user.university_name}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, margin: '8px 0 14px' }}>
          {(mentor.expertise_areas ?? []).slice(0, 3).map(t => <TagPill key={t} label={t} dark={dark} />)}
        </div>
        <button
          onClick={e => { e.stopPropagation(); if (!hasRequest && !requested) setRequested(true) }}
          style={{
            width: '100%', padding: '10px', borderRadius: 100, border: 'none',
            background: (hasRequest || requested) ? C.mint : C.orange,
            color: (hasRequest || requested) ? '#2A6A20' : C.white,
            fontSize: 13, fontWeight: 700, cursor: (hasRequest || requested) ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.2s',
          }}
        >
          {(hasRequest || requested) ? '✓ Request Sent' : <>Request <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></>}
        </button>
      </div>
    </div>
  )
}

// ─── Mentor Detail Panel ──────────────────────────────────────────────────────
function MentorDetailPanel({ mentor, onClose, dark, hasRequest }: {
  mentor: MentorProfile | null; onClose: () => void; dark: boolean; hasRequest: boolean
}) {
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState('')
  const sendRequest = useSendMentorshipRequest()
  const bg = dark ? '#161616' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  if (!mentor) return null

  async function handleSend() {
    if (sent || hasRequest || sendRequest.isPending) return
    try {
      await sendRequest.mutateAsync({ mentor_id: mentor!.user_id, goal: 'General mentorship', meeting_frequency: 'Bi-weekly', session_length_minutes: 60, message: msg || 'I would love to connect.' })
      setSent(true)
      toast.success('Mentorship request sent!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send mentorship request'))
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 300, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(480px, 100vw)', zIndex: 400, background: bg, display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 48px rgba(0,0,0,0.18)', animation: 'slideInRight 0.25s ease-out' }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 32, height: 32, borderRadius: '50%', border: `1px solid ${dark ? '#333' : C.border}`, background: bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: 15, height: 15, color: C.secondary }} />
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ height: 220, position: 'relative' }}>
            <PhotoPlaceholder s={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', top: 16, left: 16 }}><VerifiedBadge /></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>{mentor.user.full_name}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>{mentor.user.university_name}</div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <Eyebrow label="About" />
            <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 24 }}>{mentor.bio ?? 'Experienced mentor ready to help you grow.'}</p>
            <Eyebrow label="Expertise" />
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 24 }}>
              {(mentor.expertise_areas ?? []).map(t => <TagPill key={t} label={t} active />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, background: dark ? '#1E1E1E' : '#F7F5F0', marginBottom: 24 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: mentor.is_active ? '#6ABF6A' : '#E8B84A', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{mentor.is_active ? 'Currently accepting mentees' : 'Availability limited'}</div>
                <div style={{ fontSize: 12, color: C.tertiary }}>Typically responds within 48 hours</div>
              </div>
            </div>
            <Eyebrow label="Your Message" />
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Introduce yourself and share what you're hoping to get from this mentorship…"
              style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`, background: dark ? '#1A1A1A' : '#FAFAF8', padding: '14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: textColor, resize: 'none' as const, height: 100, outline: 'none', lineHeight: 1.55, marginBottom: 20, boxSizing: 'border-box' as const }} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${dark ? '#222' : C.border}` }}>
          <button onClick={handleSend} disabled={sent || hasRequest || sendRequest.isPending}
            style={{
              width: '100%', padding: '14px', borderRadius: 100, border: 'none',
              background: (sent || hasRequest) ? C.mint : C.orange,
              color: (sent || hasRequest) ? '#2A6A20' : C.white,
              fontSize: 15, fontWeight: 700, cursor: (sent || hasRequest) ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.25s',
            }}>
            {(sent || hasRequest) ? '✓ Request Sent' : sendRequest.isPending ? 'Sending…' : <>Send Request <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></>}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Browse Mentors ───────────────────────────────────────────────────────────
function BrowseMentorsView({ dark }: { dark: boolean }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MentorProfile | null>(null)
  const { data: mentors = [], isLoading } = useMentors()
  const { data: outgoingRequests = [] } = useOutgoingRequests()
  const pendingIds = new Set(outgoingRequests.filter(r => r.status === 'PENDING' || r.status === 'ACCEPTED').map(r => r.mentor_id))

  const filtered = mentors.filter(m => {
    if (!query) return true
    const q = query.toLowerCase()
    return m.user.full_name.toLowerCase().includes(q) || m.user.university_name.toLowerCase().includes(q) || (m.expertise_areas ?? []).some(e => e.toLowerCase().includes(q))
  })
  const pageCount = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 100, background: dark ? '#1A1A1A' : C.white, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}` }}>
          <Search style={{ width: 16, height: 16, color: C.tertiary, flexShrink: 0 }} />
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search by name, skill, or university…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: dark ? C.darkText : C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tertiary, fontSize: 18, lineHeight: 1 }}>×</button>}
        </div>
        <div style={{ fontSize: 13, color: C.tertiary, whiteSpace: 'nowrap' as const }}>{filtered.length} mentors</div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 280, borderRadius: 22, background: dark ? '#1A1A1A' : '#F0EDE6' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No mentors found</div>
          <div style={{ fontSize: 14, color: C.secondary }}>{query ? 'Try different keywords' : 'Check back soon'}</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18, marginBottom: 32 }}>
            {visible.map(m => <MentorGridCard key={m.id} mentor={m} dark={dark} hasRequest={pendingIds.has(m.user_id)} onSelect={setSelected} />)}
          </div>
          {pageCount > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: `1.5px solid ${dark ? '#444' : C.border}`, cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft style={{ width: 14, height: 14, color: dark ? C.darkText : C.charcoal }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: C.orange }}>{String(page).padStart(2, '0')}</span>
                <span style={{ color: C.tertiary }}>/{String(pageCount).padStart(2, '0')}</span>
              </span>
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}
                style={{ width: 28, height: 28, borderRadius: '50%', background: page === pageCount ? 'transparent' : C.orange, border: page === pageCount ? `1.5px solid ${dark ? '#444' : C.border}` : 'none', cursor: page === pageCount ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === pageCount ? 0.4 : 1 }}>
                <ChevronRight style={{ width: 14, height: 14, color: page === pageCount ? (dark ? C.darkText : C.charcoal) : C.white }} />
              </button>
            </div>
          )}
        </>
      )}
      <MentorDetailPanel mentor={selected} onClose={() => setSelected(null)} dark={dark} hasRequest={selected ? pendingIds.has(selected.user_id) : false} />
    </div>
  )
}

// ─── Manage Mentees (Alumni/Mentor) ───────────────────────────────────────────
function ManageMenteesView({ dark }: { dark: boolean }) {
  const { data: incoming = [] } = useIncomingRequests()
  const { data: mentees = [] } = useMyMentees()
  const accept = useAcceptRequest()
  const reject = useRejectRequest()
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  async function handleAccept(id: number) {
    try { await accept.mutateAsync(id); toast.success('Request accepted!') } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to accept the request'))
    }
  }
  async function handleReject(id: number) {
    try { await reject.mutateAsync(id); toast.success('Request declined') } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to decline the request'))
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <Eyebrow label="Incoming Requests" />
        {incoming.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: C.tertiary, fontSize: 14 }}>No pending requests</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {incoming.map(req => (
              <div key={req.id} style={{ background: bg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <AvatarCircle name={req.mentee.full_name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{req.mentee.full_name}</div>
                  <div style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{req.mentee.university_name}</div>
                  {req.message && <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55, margin: '0 0 12px', fontStyle: 'italic' }}>"{req.message}"</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleReject(req.id)} style={{ padding: '7px 18px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Decline</button>
                    <button onClick={() => handleAccept(req.id)} style={{ padding: '7px 18px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                      Accept <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Eyebrow label="Active Mentees" />
      {mentees.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: C.tertiary, fontSize: 14 }}>No active mentees yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mentees.map(m => (
            <div key={m.id} style={{ background: bg, borderRadius: 18, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <AvatarCircle name={m.mentee.full_name} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{m.mentee.full_name}</div>
                <div style={{ fontSize: 12, color: C.secondary }}>{m.mentee.university_name} · {m.goal}</div>
                <span style={{ display: 'inline-block', marginTop: 6, background: m.status === 'ACTIVE' ? C.mint : (dark ? '#2A2A2A' : '#F0EDE6'), color: m.status === 'ACTIVE' ? '#3A8A30' : C.tertiary, padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function MentorshipPageContent() {
  const { dark } = useDarkMode()
  const { role } = useAuth()
  const isMentor = role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL'
  const [view, setView] = useState<'browse' | 'manage'>('browse')

  return (
    <div>
      {isMentor && (
        <div style={{ display: 'inline-flex', background: dark ? '#1A1A1A' : '#F0EDE6', borderRadius: 100, padding: 4, gap: 2, marginBottom: 28 }}>
          {(['browse', 'manage'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: view === v ? (dark ? '#2A2A2A' : C.white) : 'transparent', color: view === v ? (dark ? C.darkText : C.charcoal) : C.secondary, fontSize: 13, fontWeight: view === v ? 700 : 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: view === v ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
              {v === 'browse' ? 'Browse Mentors' : 'Manage Mentees'}
            </button>
          ))}
        </div>
      )}
      {view === 'browse' ? <BrowseMentorsView dark={dark} /> : <ManageMenteesView dark={dark} />}
    </div>
  )
}

export default function MentorshipPage() {
  return (
    <DashboardLayout>
      <MentorshipPageContent />
    </DashboardLayout>
  )
}
