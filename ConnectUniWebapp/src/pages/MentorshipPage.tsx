import { useState } from 'react'
import {
  Search, X, ChevronLeft, ChevronRight, Star, Calendar, Plus,
  Link as LinkIcon, BookOpen, CheckCircle, Users, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, AvatarCircle, useDarkMode } from '@/components/layouts/DashboardLayout'
import {
  useMentors, useOutgoingRequests,
  useIncomingRequests, useMyMenteesRich, useMyMentorsRich,
  useAcceptRequest, useRejectRequest, useCancelRequest,
  useSessions, useCreateSession,
  useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone,
  useResources, useShareResource,
  useMyMentorProfile, useBecomeMentor, useUpdateMentorProfile,
  useMentorshipStats, useLeaveReview,
} from '@/hooks/useMentorship'
import type { MentorProfile, MyMenteeResponse, MyMentorResponse } from '@/hooks/useMentorship'
import { MentorRequestDialog } from '@/components/mentorship/MentorRequestDialog'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { format, isPast } from 'date-fns'

const PER_PAGE = 6

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
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

function StarRating({ rating, count, size = 12 }: { rating: number | null; count?: number; size?: number }) {
  if (!rating) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} style={{ width: size, height: size, fill: i <= Math.round(rating) ? '#F5C842' : 'transparent', color: i <= Math.round(rating) ? '#F5C842' : C.tertiary }} />
      ))}
      <span style={{ fontSize: size - 1, color: C.tertiary, marginLeft: 2 }}>
        {rating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
      </span>
    </div>
  )
}

function MatchBadge({ pct }: { pct: number | null }) {
  if (pct == null) return null
  const color = pct >= 75 ? '#3A9A40' : pct >= 50 ? C.orange : C.secondary
  const bg    = pct >= 75 ? 'rgba(58,154,64,0.12)' : pct >= 50 ? 'rgba(239,75,36,0.12)' : 'rgba(0,0,0,0.06)'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: bg, color, whiteSpace: 'nowrap' as const }}>
      {pct}% match
    </span>
  )
}

function ProgressBar({ value, dark }: { value: number; dark: boolean }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: dark ? '#2A2A2A' : '#E5E5E5', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: value >= 75 ? '#3A9A40' : C.orange, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  )
}

// ─── Session Scheduling Modal ──────────────────────────────────────────────────
function ScheduleSessionModal({ relationshipId, dark, onClose }: {
  relationshipId: number; dark: boolean; onClose: () => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const createSession = useCreateSession()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) { toast.error('Please select a date and time'); return }
    try {
      await createSession.mutateAsync({
        relationshipId,
        scheduled_at: new Date(`${date}T${time}:00`).toISOString(),
        notes: notes || undefined,
      })
      toast.success('Session scheduled!')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to schedule session'))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 10, border: `1.5px solid ${dark ? '#333' : C.border}`,
    padding: '10px 12px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(420px, calc(100vw - 32px))', background: dark ? '#161616' : C.white, borderRadius: 22, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease-out' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Schedule Session</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.secondary }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Time</div>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} required />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Notes (Optional)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Agenda, topics to cover…" style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 } as React.CSSProperties} />
          </div>
          <button type="submit" disabled={createSession.isPending}
            style={{ width: '100%', padding: '12px', borderRadius: 100, border: 'none', background: createSession.isPending ? C.mint : C.orange, color: createSession.isPending ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {createSession.isPending ? 'Scheduling…' : 'Confirm Session'}
          </button>
        </form>
      </div>
    </>
  )
}

// ─── Share Resource Modal ──────────────────────────────────────────────────────
function ShareResourceModal({ relationshipId, dark, onClose }: {
  relationshipId: number; dark: boolean; onClose: () => void
}) {
  const [form, setForm] = useState({ title: '', url: '', category: 'Article', note: '' })
  const shareResource = useShareResource()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.url) { toast.error('Title and URL are required'); return }
    try {
      await shareResource.mutateAsync({ relationshipId, ...form, note: form.note || undefined })
      toast.success('Resource shared!')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to share resource'))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 10, border: `1.5px solid ${dark ? '#333' : C.border}`,
    padding: '10px 12px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(420px, calc(100vw - 32px))', background: dark ? '#161616' : C.white, borderRadius: 22, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease-out' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Share Resource</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.secondary }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Title</div>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. System Design Primer" style={inputStyle} required />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>URL</div>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." style={inputStyle} required />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Category</div>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['Article', 'Video', 'Book', 'Tool', 'Course', 'Template', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Note (Optional)</div>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} placeholder="Why you're sharing this…" style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 } as React.CSSProperties} />
          </div>
          <button type="submit" disabled={shareResource.isPending}
            style={{ padding: '12px', borderRadius: 100, border: 'none', background: shareResource.isPending ? C.mint : C.orange, color: shareResource.isPending ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {shareResource.isPending ? 'Sharing…' : 'Share Resource'}
          </button>
        </form>
      </div>
    </>
  )
}

// ─── Add Milestone Modal ────────────────────────────────────────────────────────
function AddMilestoneModal({ relationshipId, dark, onClose }: {
  relationshipId: number; dark: boolean; onClose: () => void
}) {
  const [form, setForm] = useState({ title: '', description: '', target_date: '' })
  const createMilestone = useCreateMilestone()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast.error('Title is required'); return }
    try {
      await createMilestone.mutateAsync({ relationshipId, ...form, target_date: form.target_date || undefined, description: form.description || undefined })
      toast.success('Milestone added!')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add milestone'))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 10, border: `1.5px solid ${dark ? '#333' : C.border}`,
    padding: '10px 12px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(400px, calc(100vw - 32px))', background: dark ? '#161616' : C.white, borderRadius: 22, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease-out' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Add Milestone</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.secondary }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Title</div>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Complete take-home project" style={inputStyle} required />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 6 }}>Target Date (Optional)</div>
            <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} style={inputStyle} />
          </div>
          <button type="submit" disabled={createMilestone.isPending}
            style={{ padding: '12px', borderRadius: 100, border: 'none', background: createMilestone.isPending ? C.mint : C.orange, color: createMilestone.isPending ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {createMilestone.isPending ? 'Adding…' : 'Add Milestone'}
          </button>
        </form>
      </div>
    </>
  )
}

// ─── Leave Review Modal ────────────────────────────────────────────────────────
function LeaveReviewModal({ relationshipId, mentorName, dark, onClose }: {
  relationshipId: number; mentorName: string; dark: boolean; onClose: () => void
}) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const leaveReview = useLeaveReview()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await leaveReview.mutateAsync({ relationshipId, rating, review_text: text || undefined })
      toast.success('Review submitted!')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit review'))
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 600, width: 'min(420px, calc(100vw - 32px))', background: dark ? '#161616' : C.white, borderRadius: 22, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease-out' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Rate your mentorship</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.secondary }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px' }}>
          <div style={{ fontSize: 14, color: C.secondary, marginBottom: 16 }}>How was your experience with <strong style={{ color: dark ? C.darkText : C.charcoal }}>{mentorName}</strong>?</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" onClick={() => setRating(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Star style={{ width: 32, height: 32, fill: i <= rating ? '#F5C842' : 'transparent', color: i <= rating ? '#F5C842' : C.tertiary }} />
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
            placeholder="Share your experience (optional)…"
            style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${dark ? '#333' : C.border}`, padding: '10px 12px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8', outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.5, marginBottom: 16 } as React.CSSProperties}
          />
          <button type="submit" disabled={leaveReview.isPending}
            style={{ width: '100%', padding: '12px', borderRadius: 100, border: 'none', background: leaveReview.isPending ? C.mint : C.orange, color: leaveReview.isPending ? C.charcoal : C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {leaveReview.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </>
  )
}

// ─── Active Relationship Expanded Card ────────────────────────────────────────
function RelationshipCard({ rel, role, dark }: {
  rel: MyMenteeResponse | MyMentorResponse
  role: 'mentor' | 'mentee'
  dark: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const { data: sessions = [] } = useSessions(expanded ? rel.relationship_id : undefined)
  const { data: milestones = [] } = useMilestones(expanded ? rel.relationship_id : undefined)
  const { data: resources = [] } = useResources(expanded ? rel.relationship_id : undefined)
  const updateMilestone = useUpdateMilestone()
  const deleteMilestone = useDeleteMilestone()

  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal
  const progress = rel.progress_percentage ?? 0

  const person = role === 'mentee'
    ? (rel as MyMentorResponse).mentor
    : (rel as MyMenteeResponse).mentee

  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' && !isPast(new Date(s.scheduled_at)))
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
  const completedMilestones = milestones.filter(m => m.status === 'COMPLETED')

  return (
    <>
      <div style={{ background: bg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, overflow: 'hidden', marginBottom: 14 }}>
        {/* Card header */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <AvatarCircle name={person.full_name} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{person.full_name}</div>
            <div style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>{person.university_name} · {rel.goal}</div>
            <ProgressBar value={progress} dark={dark} />
            <div style={{ fontSize: 11, color: C.tertiary, marginTop: 4 }}>
              {progress}% complete · {completedMilestones.length}/{milestones.length || rel.milestones?.total || 0} milestones
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: rel.status === 'ACTIVE' ? 'rgba(58,154,64,0.12)' : 'rgba(0,0,0,0.06)', color: rel.status === 'ACTIVE' ? '#3A9A40' : C.secondary }}>
              {rel.status}
            </span>
            {rel.next_session && (
              <span style={{ fontSize: 11, color: C.tertiary, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Calendar style={{ width: 11, height: 11 }} />
                {format(new Date(rel.next_session.scheduled_at), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '18px 20px' }}>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
              <button onClick={() => setScheduleOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <Calendar style={{ width: 12, height: 12 }} /> Schedule Session
              </button>
              {role === 'mentor' && (
                <button onClick={() => setMilestoneOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: dark ? C.darkText : C.charcoal, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <Plus style={{ width: 12, height: 12 }} /> Add Milestone
                </button>
              )}
              <button onClick={() => setResourceOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: dark ? C.darkText : C.charcoal, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <BookOpen style={{ width: 12, height: 12 }} /> Share Resource
              </button>
              {role === 'mentee' && rel.status === 'ENDED' && (
                <button onClick={() => setReviewOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${C.orange}`, background: 'transparent', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <Star style={{ width: 12, height: 12 }} /> Leave Review
                </button>
              )}
            </div>

            {/* Sessions */}
            {upcomingSessions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Upcoming Sessions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {upcomingSessions.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: dark ? '#222' : '#F7F5F0', border: `1px solid ${dark ? '#2A2A2A' : C.border}` }}>
                      <Calendar style={{ width: 14, height: 14, color: C.orange, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{format(new Date(s.scheduled_at), 'EEEE, MMM d · h:mm a')}</div>
                        {s.notes && <div style={{ fontSize: 12, color: C.secondary }}>{s.notes}</div>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(58,154,64,0.12)', color: '#3A9A40' }}>Scheduled</span>
                    </div>
                  ))}
                </div>
                {completedSessions.length > 0 && (
                  <div style={{ fontSize: 12, color: C.tertiary, marginTop: 8 }}>{completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''} completed</div>
                )}
              </div>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Milestones</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {milestones.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: dark ? '#222' : '#F7F5F0' }}>
                      <button
                        onClick={() => updateMilestone.mutate({ milestoneId: m.id, relationshipId: rel.relationship_id, status: m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                        <CheckCircle style={{ width: 16, height: 16, color: m.status === 'COMPLETED' ? '#3A9A40' : C.tertiary, fill: m.status === 'COMPLETED' ? 'rgba(58,154,64,0.15)' : 'none' }} />
                      </button>
                      <span style={{ flex: 1, fontSize: 13, color: m.status === 'COMPLETED' ? C.tertiary : textColor, textDecoration: m.status === 'COMPLETED' ? 'line-through' : 'none' }}>{m.title}</span>
                      {m.target_date && <span style={{ fontSize: 11, color: C.tertiary }}>{format(new Date(m.target_date), 'MMM d')}</span>}
                      {role === 'mentor' && (
                        <button onClick={() => deleteMilestone.mutate({ milestoneId: m.id, relationshipId: rel.relationship_id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tertiary, padding: 2 }}>
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Shared Resources</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {resources.map(r => (
                    <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: dark ? '#222' : '#F7F5F0', textDecoration: 'none' }}>
                      <LinkIcon style={{ width: 13, height: 13, color: C.orange, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</div>
                        {r.note && <div style={{ fontSize: 11, color: C.secondary }}>{r.note}</div>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: dark ? '#2A2A2A' : '#EDE9E3', color: C.tertiary, flexShrink: 0 }}>{r.category}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {scheduleOpen && <ScheduleSessionModal relationshipId={rel.relationship_id} dark={dark} onClose={() => setScheduleOpen(false)} />}
      {milestoneOpen && <AddMilestoneModal relationshipId={rel.relationship_id} dark={dark} onClose={() => setMilestoneOpen(false)} />}
      {resourceOpen && <ShareResourceModal relationshipId={rel.relationship_id} dark={dark} onClose={() => setResourceOpen(false)} />}
      {reviewOpen && role === 'mentee' && (
        <LeaveReviewModal
          relationshipId={rel.relationship_id}
          mentorName={(rel as MyMentorResponse).mentor.full_name}
          dark={dark}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </>
  )
}

// ─── Mentor Grid Card ─────────────────────────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(145deg, #B87040 0%, #D4935A 50%, #8B5030 100%)',
  'linear-gradient(145deg, #4A6A8A 0%, #6A8FAA 50%, #3A5A7A 100%)',
  'linear-gradient(145deg, #6A4A8A 0%, #8A6AAA 50%, #4A2A6A 100%)',
  'linear-gradient(145deg, #4A8A6A 0%, #6AAA8A 50%, #2A6A4A 100%)',
  'linear-gradient(145deg, #8A5A4A 0%, #AA7A6A 50%, #6A3A2A 100%)',
]

function MentorGridCard({ mentor, dark, hasRequest, onSelect, onRequest }: {
  mentor: MentorProfile; dark: boolean; hasRequest: boolean
  onSelect: (m: MentorProfile) => void
  onRequest: (m: MentorProfile) => void
}) {
  const [hov, setHov] = useState(false)
  const bg = dark ? '#1A1A1A' : C.white
  const grad = GRADIENTS[mentor.id % GRADIENTS.length]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(mentor)}
      style={{
        borderRadius: 22, background: bg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Cover image */}
      <div style={{ height: 140, position: 'relative', background: grad }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}><VerifiedBadge /></div>
        {mentor.match_percentage != null && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <MatchBadge pct={mentor.match_percentage} />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 10, left: 12, width: 10, height: 10, borderRadius: '50%', background: mentor.is_active ? '#6ABF6A' : '#E8B84A', border: '2px solid white' }} />
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 1 }}>{mentor.user.full_name}</div>
        <div style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>{mentor.user.university_name}</div>
        {(mentor.average_rating != null) && (
          <div style={{ marginBottom: 8 }}>
            <StarRating rating={mentor.average_rating} count={mentor.total_reviews} size={11} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginBottom: 14 }}>
          {(mentor.expertise_areas ?? []).slice(0, 3).map(t => <TagPill key={t} label={t} dark={dark} />)}
        </div>
        <button
          onClick={e => { e.stopPropagation(); if (!hasRequest) onRequest(mentor) }}
          style={{
            width: '100%', padding: '10px', borderRadius: 100, border: 'none',
            background: hasRequest ? C.mint : C.orange,
            color: hasRequest ? '#2A6A20' : C.white,
            fontSize: 13, fontWeight: 700, cursor: hasRequest ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.2s',
          }}
        >
          {hasRequest ? '✓ Request Sent' : <>Connect <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></>}
        </button>
      </div>
    </div>
  )
}

// ─── Browse Mentors ───────────────────────────────────────────────────────────
function BrowseMentorsView({ dark }: { dark: boolean }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MentorProfile | null>(null)
  const [requestTarget, setRequestTarget] = useState<MentorProfile | null>(null)
  const { data: mentors = [], isLoading } = useMentors()
  const { data: outgoingRequests = [] } = useOutgoingRequests()
  const pendingIds = new Set(
    outgoingRequests
      .filter(r => r.status.toLowerCase() === 'pending')
      .map(r => r.mentor_id)
  )

  const filtered = mentors.filter(m => {
    if (!query) return true
    const q = query.toLowerCase()
    return m.user.full_name.toLowerCase().includes(q) || m.user.university_name.toLowerCase().includes(q) || (m.expertise_areas ?? []).some(e => e.toLowerCase().includes(q))
  })

  // Sort by match_percentage descending
  const sorted = [...filtered].sort((a, b) => (b.match_percentage ?? 0) - (a.match_percentage ?? 0))
  const pageCount = Math.ceil(sorted.length / PER_PAGE)
  const visible = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 100, background: dark ? '#1A1A1A' : C.white, border: `1.5px solid ${dark ? '#2A2A2A' : C.border}` }}>
          <Search style={{ width: 16, height: 16, color: C.tertiary, flexShrink: 0 }} />
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search by name, skill, or university…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: dark ? C.darkText : C.charcoal, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tertiary, fontSize: 18, lineHeight: 1 }}>×</button>}
        </div>
        <div style={{ fontSize: 13, color: C.tertiary, whiteSpace: 'nowrap' as const }}>{sorted.length} mentor{sorted.length !== 1 ? 's' : ''}</div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 300, borderRadius: 22, background: dark ? '#1A1A1A' : '#F0EDE6' }} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Users style={{ width: 36, height: 36, color: C.orange }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No mentors found</div>
          <div style={{ fontSize: 14, color: C.secondary }}>{query ? 'Try different keywords' : 'Check back soon'}</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18, marginBottom: 32 }}>
            {visible.map(m => (
              <MentorGridCard key={m.id} mentor={m} dark={dark}
                hasRequest={pendingIds.has(m.user_id)}
                onSelect={setSelected}
                onRequest={setRequestTarget}
              />
            ))}
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

      {/* Mentor detail slide-over */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 300, backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(480px, 100vw)', zIndex: 400, background: dark ? '#161616' : C.white, display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 48px rgba(0,0,0,0.18)', animation: 'slideInRight 0.25s ease-out', overflowY: 'auto' }}>
            <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 32, height: 32, borderRadius: '50%', border: `1px solid ${dark ? '#333' : C.border}`, background: dark ? '#161616' : C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: 15, height: 15, color: C.secondary }} />
            </button>
            <div style={{ height: 220, position: 'relative', background: GRADIENTS[selected.id % GRADIENTS.length], flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: 8 }}>
                <VerifiedBadge />
                {selected.match_percentage != null && <MatchBadge pct={selected.match_percentage} />}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>{selected.user.full_name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>{selected.user.university_name}</div>
              </div>
            </div>
            <div style={{ padding: '20px 24px', flex: 1 }}>
              {selected.average_rating != null && (
                <div style={{ marginBottom: 16 }}>
                  <StarRating rating={selected.average_rating} count={selected.total_reviews} size={14} />
                </div>
              )}
              <Eyebrow label="About" />
              <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 20 }}>{selected.bio ?? 'Experienced mentor ready to help you grow.'}</p>
              <Eyebrow label="Expertise" />
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 20 }}>
                {(selected.expertise_areas ?? []).map(t => <TagPill key={t} label={t} active />)}
              </div>
              {(selected.mentorship_goals ?? []).length > 0 && (
                <>
                  <Eyebrow label="Can help with" />
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 20 }}>
                    {(selected.mentorship_goals ?? []).map(t => <TagPill key={t} label={t} dark={dark} />)}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 16, padding: '14px 16px', borderRadius: 14, background: dark ? '#1E1E1E' : '#F7F5F0', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', fontWeight: 600 }}>Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.is_active ? '#6ABF6A' : '#E8B84A' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>{selected.is_active ? 'Accepting mentees' : 'Limited availability'}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', fontWeight: 600 }}>Max Mentees</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: dark ? C.darkText : C.charcoal, marginTop: 4 }}>{selected.max_mentees}</div>
                </div>
              </div>
              {selected.linkedin_url && (
                <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.orange, textDecoration: 'none', marginBottom: 20 }}>
                  <LinkIcon style={{ width: 13, height: 13 }} /> View LinkedIn Profile
                </a>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${dark ? '#222' : C.border}`, flexShrink: 0 }}>
              <button
                onClick={() => { setRequestTarget(selected); setSelected(null) }}
                disabled={pendingIds.has(selected.user_id)}
                style={{ width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: pendingIds.has(selected.user_id) ? C.mint : C.orange, color: pendingIds.has(selected.user_id) ? '#2A6A20' : C.white, fontSize: 15, fontWeight: 700, cursor: pendingIds.has(selected.user_id) ? 'default' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {pendingIds.has(selected.user_id) ? '✓ Request Already Sent' : 'Send Mentorship Request ↗'}
              </button>
            </div>
          </div>
        </>
      )}

      <MentorRequestDialog
        mentor={requestTarget}
        open={requestTarget !== null}
        onOpenChange={open => { if (!open) setRequestTarget(null) }}
      />
    </div>
  )
}

// ─── My Mentors (Mentee View) ──────────────────────────────────────────────────
function MyMentorsView({ dark }: { dark: boolean }) {
  const { data: mentorsRich = [], isLoading } = useMyMentorsRich()
  const { data: outgoing = [] } = useOutgoingRequests()
  const cancelReq = useCancelRequest()
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  const pending = outgoing.filter(r => r.status === 'pending')
  const active = mentorsRich.filter(m => m.status === 'ACTIVE')
  const ended = mentorsRich.filter(m => m.status === 'ENDED')

  return (
    <div>
      {/* Pending requests */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Eyebrow label="Pending Requests" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(req => (
              <div key={req.id} style={{ background: bg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <AvatarCircle name={req.mentor.full_name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{req.mentor.full_name}</div>
                  <div style={{ fontSize: 12, color: C.secondary }}>{req.goal} · {req.meeting_frequency}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(245,200,66,0.15)', color: '#B8920A' }}>Pending</span>
                  <button onClick={() => cancelReq.mutate(req.id)}
                    style={{ padding: '6px 12px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.tertiary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active mentors */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ height: 100, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />)}
        </div>
      ) : active.length === 0 && pending.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Users style={{ width: 30, height: 30, color: C.orange }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 8 }}>No active mentors</div>
          <div style={{ fontSize: 14, color: C.secondary }}>Browse mentors to find your perfect match</div>
        </div>
      ) : (
        <div>
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Eyebrow label="Active Mentors" />
              {active.map(m => (
                <RelationshipCard key={m.relationship_id} rel={m} role="mentee" dark={dark} />
              ))}
            </div>
          )}
          {ended.length > 0 && (
            <div>
              <Eyebrow label="Completed" />
              {ended.map(m => (
                <RelationshipCard key={m.relationship_id} rel={m} role="mentee" dark={dark} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Manage Mentees (Mentor View) ──────────────────────────────────────────────
function ManageMenteesView({ dark }: { dark: boolean }) {
  const { data: incoming = [], isLoading: incomingLoading } = useIncomingRequests()
  const { data: menteesRich = [], isLoading: menteesLoading } = useMyMenteesRich()
  const accept = useAcceptRequest()
  const reject = useRejectRequest()
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  const pendingIncoming = incoming.filter(r => r.status === 'pending')
  const active = menteesRich.filter(m => m.status === 'ACTIVE')
  const ended = menteesRich.filter(m => m.status === 'ENDED')

  async function handleAccept(id: number) {
    try { await accept.mutateAsync(id); toast.success('Request accepted! New mentee added.') } catch (error) {
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
      {/* Incoming requests */}
      <div style={{ marginBottom: 36 }}>
        <Eyebrow label={`Incoming Requests${pendingIncoming.length > 0 ? ` (${pendingIncoming.length})` : ''}`} />
        {incomingLoading ? (
          <div style={{ height: 80, borderRadius: 16, background: dark ? '#1A1A1A' : '#F0EDE6' }} />
        ) : pendingIncoming.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: C.tertiary, fontSize: 14, background: bg, borderRadius: 16, border: `1px solid ${dark ? '#2A2A2A' : C.border}` }}>
            No pending requests
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingIncoming.map(req => (
              <div key={req.id} style={{ background: bg, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <AvatarCircle name={req.mentee.full_name} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{req.mentee.full_name}</div>
                  <div style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>
                    {req.mentee.university_name} · {req.goal} · {req.meeting_frequency} · {req.session_length_minutes}min
                  </div>
                  {req.message && (
                    <div style={{ padding: '10px 12px', borderRadius: 10, background: dark ? '#222' : '#F7F5F0', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>"{req.message}"</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleReject(req.id)} disabled={reject.isPending}
                      style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Decline
                    </button>
                    <button onClick={() => handleAccept(req.id)} disabled={accept.isPending}
                      style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {accept.isPending ? 'Accepting…' : <>Accept ↗</>}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.tertiary, flexShrink: 0 }}>
                  {format(new Date(req.created_at), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active mentees */}
      {menteesLoading ? (
        <div style={{ height: 100, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />
      ) : (
        <div>
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Eyebrow label={`Active Mentees (${active.length})`} />
              {active.map(m => (
                <RelationshipCard key={m.relationship_id} rel={m} role="mentor" dark={dark} />
              ))}
            </div>
          )}
          {ended.length > 0 && (
            <div>
              <Eyebrow label="Completed" />
              {ended.map(m => (
                <RelationshipCard key={m.relationship_id} rel={m} role="mentor" dark={dark} />
              ))}
            </div>
          )}
          {active.length === 0 && pendingIncoming.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No active mentees yet</div>
              <div style={{ fontSize: 14, color: C.secondary }}>Accept incoming requests to start mentoring</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── My Mentor Profile ─────────────────────────────────────────────────────────
function MyProfileView({ dark }: { dark: boolean }) {
  const { data: profile, isLoading } = useMyMentorProfile()
  const { data: stats } = useMentorshipStats()
  const becomeMentor = useBecomeMentor()
  const updateProfile = useUpdateMentorProfile()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', expertise_areas: '', mentorship_goals: '', max_mentees: 3, linkedin_url: '' })
  const bg = dark ? '#1A1A1A' : C.white
  const textColor = dark ? C.darkText : C.charcoal

  const isMentor = !!profile

  function startEdit() {
    if (profile) {
      setForm({
        bio: profile.bio ?? '',
        expertise_areas: (profile.expertise_areas ?? []).join(', '),
        mentorship_goals: (profile.mentorship_goals ?? []).join(', '),
        max_mentees: profile.max_mentees,
        linkedin_url: profile.linkedin_url ?? '',
      })
    }
    setEditing(true)
  }

  async function handleSave() {
    const data = {
      bio: form.bio || undefined,
      linkedin_url: form.linkedin_url || undefined,
      expertise_areas: form.expertise_areas.split(',').map(s => s.trim()).filter(Boolean),
      mentorship_goals: form.mentorship_goals.split(',').map(s => s.trim()).filter(Boolean),
      max_mentees: form.max_mentees,
    }
    try {
      if (isMentor) {
        await updateProfile.mutateAsync(data)
      } else {
        await becomeMentor.mutateAsync(data)
      }
      toast.success(isMentor ? 'Profile updated!' : 'Mentor profile created!')
      setEditing(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save profile'))
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 12, border: `1.5px solid ${dark ? '#333' : C.border}`,
    padding: '10px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal, background: dark ? '#0E0E0E' : '#FAFAF8',
    outline: 'none', boxSizing: 'border-box',
  }

  if (isLoading) return <div style={{ height: 200, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />

  if (!isMentor && !editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Users style={{ width: 30, height: 30, color: C.orange }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: textColor, marginBottom: 10 }}>Become a Mentor</div>
        <div style={{ fontSize: 14, color: C.secondary, maxWidth: 380, lineHeight: 1.7, marginBottom: 28 }}>
          Share your expertise and help students and peers navigate their careers and academic journeys.
        </div>
        <button onClick={() => startEdit()}
          style={{ padding: '13px 32px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Set Up Mentor Profile ↗
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Stats row */}
      {stats && isMentor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Active Mentees', value: stats.as_mentor.active_mentees },
            { label: 'Total Mentees', value: stats.as_mentor.total_mentees },
            { label: 'Sessions', value: stats.as_mentor.total_sessions },
            { label: 'Pending', value: stats.as_mentor.pending_requests },
          ].map(s => (
            <div key={s.label} style={{ background: bg, borderRadius: 16, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: textColor }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.tertiary, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: bg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{isMentor ? 'My Mentor Profile' : 'Create Mentor Profile'}</div>
          {!editing && isMentor && (
            <button onClick={startEdit}
              style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: dark ? C.darkText : C.charcoal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Edit Profile
            </button>
          )}
        </div>

        {!editing && isMentor && profile ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: profile.is_active ? '#6ABF6A' : '#E8B84A' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: profile.is_active ? '#3A9A40' : '#B8920A' }}>{profile.is_active ? 'Accepting mentees' : 'Limited availability'}</span>
              {profile.average_rating != null && (
                <div style={{ marginLeft: 'auto' }}>
                  <StarRating rating={profile.average_rating} count={profile.total_reviews} />
                </div>
              )}
            </div>
            <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 16 }}>{profile.bio ?? 'No bio added yet.'}</p>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Expertise</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>{(profile.expertise_areas ?? []).map(t => <TagPill key={t} label={t} active />)}</div>
            </div>
            {(profile.mentorship_goals ?? []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Can help with</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>{(profile.mentorship_goals ?? []).map(t => <TagPill key={t} label={t} dark={dark} />)}</div>
              </div>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.orange, textDecoration: 'none' }}>
                <LinkIcon style={{ width: 13, height: 13 }} /> LinkedIn Profile
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 7 }}>Bio</div>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                placeholder="Tell mentees about your background and what you can offer…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 7 }}>Expertise Areas <span style={{ color: C.tertiary, fontWeight: 400 }}>(comma-separated)</span></div>
              <input value={form.expertise_areas} onChange={e => setForm(f => ({ ...f, expertise_areas: e.target.value }))} placeholder="e.g. Product Design, UX Research, Startup Strategy" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 7 }}>I can help with <span style={{ color: C.tertiary, fontWeight: 400 }}>(comma-separated)</span></div>
              <input value={form.mentorship_goals} onChange={e => setForm(f => ({ ...f, mentorship_goals: e.target.value }))} placeholder="e.g. Career guidance, Interview prep, Portfolio review" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 7 }}>LinkedIn URL</div>
              <input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 7 }}>Max Mentees</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 5, 10].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, max_mentees: n }))}
                    style={{ padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${form.max_mentees === n ? C.orange : (dark ? '#333' : C.border)}`, background: form.max_mentees === n ? C.orange + '18' : 'transparent', color: form.max_mentees === n ? C.orange : (dark ? C.darkText : C.charcoal), fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {editing && (
                <button onClick={() => setEditing(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 100, border: `1.5px solid ${dark ? '#333' : C.border}`, background: 'transparent', color: C.secondary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Cancel
                </button>
              )}
              <button onClick={handleSave} disabled={becomeMentor.isPending || updateProfile.isPending}
                style={{ flex: 1, padding: '12px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {(becomeMentor.isPending || updateProfile.isPending) ? 'Saving…' : isMentor ? 'Save Changes' : 'Create Profile ↗'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function MentorshipPageContent() {
  const { dark } = useDarkMode()
  const { role } = useAuth()
  const isMentor = role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL'

  const tabs = [
    { id: 'browse',  label: 'Find a Mentor' },
    { id: 'mine',    label: 'My Mentors' },
    ...(isMentor ? [
      { id: 'manage', label: 'Manage Mentees' },
      { id: 'profile', label: 'My Profile' },
    ] : []),
  ] as const
  type TabId = typeof tabs[number]['id']

  const [tab, setTab] = useState<TabId>('browse')

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'inline-flex', background: dark ? '#1A1A1A' : '#F0EDE6', borderRadius: 100, padding: 4, gap: 2, marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as TabId)}
            style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: tab === t.id ? (dark ? '#2A2A2A' : C.white) : 'transparent', color: tab === t.id ? (dark ? C.darkText : C.charcoal) : C.secondary, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse'  && <BrowseMentorsView dark={dark} />}
      {tab === 'mine'    && <MyMentorsView dark={dark} />}
      {tab === 'manage'  && isMentor && <ManageMenteesView dark={dark} />}
      {tab === 'profile' && isMentor && <MyProfileView dark={dark} />}
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
