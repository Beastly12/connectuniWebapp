import { useState } from 'react'
import { Clock, MapPin, Users, ChevronLeft, Plus, ArrowUpRight, Globe, Calendar, Search } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useEvents, useMyRsvps, useCreateEvent, useRsvpEvent, useCancelRsvp } from '@/hooks/useEvents'
import type { ApiEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { format, isThisWeek, isAfter, addWeeks } from 'date-fns'

const TYPE_COLORS: Record<string, string> = {
  networking: C.orange,
  career: '#6B7FA3',
  academic: '#8B6FA8',
  social: '#4A9A5A',
  virtual: '#4A5AA8',
  online: '#4A5AA8',
}

const EVENT_TYPES = ['All', 'Academic', 'Social', 'Career', 'Networking']

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #B87040 0%, #D4935A 50%, #8B5030 100%)',
  'linear-gradient(135deg, #4A6A8A 0%, #6A8FAA 50%, #3A5A7A 100%)',
  'linear-gradient(135deg, #6A4A8A 0%, #8A6AAA 50%, #4A2A6A 100%)',
  'linear-gradient(135deg, #4A8A6A 0%, #6AAA8A 50%, #2A6A4A 100%)',
  'linear-gradient(135deg, #8A6A4A 0%, #AA8A6A 50%, #6A4A2A 100%)',
]

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

// ─── Event Cover ──────────────────────────────────────────────────────────────
function EventCover({ event, style }: { event: ApiEvent; style?: React.CSSProperties }) {
  const idx = event.id % COVER_GRADIENTS.length
  if (event.cover_image_url) {
    return <div style={{ background: `url(${event.cover_image_url}) center/cover no-repeat`, ...style }} />
  }
  return <div style={{ background: COVER_GRADIENTS[idx], ...style }} />
}

// ─── Featured Event Hero ──────────────────────────────────────────────────────
function FeaturedEvent({ event, isRsvped, onRsvp, onCancel, onSelect, dark, isRsvping, isCancelling }: {
  event: ApiEvent
  isRsvped: boolean
  onRsvp: () => void
  onCancel: () => void
  onSelect: (e: ApiEvent) => void
  dark: boolean
  isRsvping?: boolean
  isCancelling?: boolean
}) {
  const eventDate = new Date(event.event_date)
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary

  return (
    <div
      onClick={() => onSelect(event)}
      style={{
        borderRadius: 22, overflow: 'hidden', cursor: 'pointer', marginBottom: 28,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: dark ? '#1A1A1A' : C.white,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <EventCover event={event} style={{ minHeight: 220 }} />
      <div style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: typeColor + '22', color: typeColor }}>
              {event.event_type ?? 'Event'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: dark ? '#2A2A2A' : '#F0EDE6', color: C.orange }}>
              Featured
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 10 }}>
            {event.title}
          </div>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        </div>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, marginBottom: 16, fontSize: 12, color: C.tertiary }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar style={{ width: 13, height: 13 }} />{format(eventDate, 'MMM d, yyyy')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 13, height: 13 }} />{format(eventDate, 'h:mm a')}
            </span>
            {event.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin style={{ width: 13, height: 13 }} />{event.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users style={{ width: 13, height: 13 }} />{event.attendee_count} attending
            </span>
          </div>
          {isRsvped ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '9px 18px', borderRadius: 100 }}>✓ Attending</span>
              <button onClick={e => { e.stopPropagation(); onCancel() }} disabled={isCancelling}
                style={{ fontSize: 12, color: C.tertiary, background: 'none', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: isCancelling ? 0.5 : 1 }}>
                {isCancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button onClick={e => { e.stopPropagation(); onRsvp() }} disabled={isRsvping}
              style={{ padding: '10px 22px', borderRadius: 100, border: 'none', background: isRsvping ? C.mint : C.orange, color: isRsvping ? C.charcoal : C.white, fontSize: 13, fontWeight: 700, cursor: isRsvping ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isRsvping ? 'Saving…' : <><span>RSVP</span><ArrowUpRight style={{ width: 14, height: 14 }} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Event Grid Card ──────────────────────────────────────────────────────────
function EventGridCard({ event, isRsvped, onRsvp, onCancel, onSelect, dark, isRsvping, isCancelling }: {
  event: ApiEvent
  isRsvped: boolean
  onRsvp: () => void
  onCancel: () => void
  onSelect: (e: ApiEvent) => void
  dark: boolean
  isRsvping?: boolean
  isCancelling?: boolean
}) {
  const [hov, setHov] = useState(false)
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const bg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(event)}
      style={{
        background: bg, borderRadius: 18,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 10px 28px rgba(0,0,0,${dark ? 0.3 : 0.08})` : 'none',
      }}
    >
      <EventCover event={event} style={{ height: 120 }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {event.event_type && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: typeColor + '22', color: typeColor }}>
              {event.event_type}
            </span>
          )}
          {isPast && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: dark ? '#2A2A2A' : '#F0EDE6', color: C.tertiary }}>Past</span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal, marginBottom: 6, lineHeight: 1.3 }}>{event.title}</div>
        <div style={{ fontSize: 11, color: C.tertiary, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar style={{ width: 11, height: 11 }} />{format(eventDate, 'MMM d')} at {format(eventDate, 'h:mm a')}
          </span>
          {event.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin style={{ width: 11, height: 11 }} />{event.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users style={{ width: 11, height: 11 }} />{event.attendee_count} attending
          </span>
        </div>
        {!isPast && (
          <div style={{ marginTop: 12 }}>
            {isRsvped ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '5px 12px', borderRadius: 100 }}>✓ Attending</span>
                <button onClick={e => { e.stopPropagation(); onCancel() }} disabled={isCancelling}
                  style={{ fontSize: 10, color: C.tertiary, background: 'none', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: isCancelling ? 0.5 : 1 }}>
                  {isCancelling ? 'Cancelling…' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button onClick={e => { e.stopPropagation(); onRsvp() }} disabled={isRsvping}
                style={{ padding: '7px 14px', borderRadius: 100, border: 'none', background: isRsvping ? C.mint : C.orange, color: isRsvping ? C.charcoal : C.white, fontSize: 11, fontWeight: 700, cursor: isRsvping ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {isRsvping ? 'Saving…' : 'RSVP ↗'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Event List Row ───────────────────────────────────────────────────────────
function EventListRow({ event, isRsvped, onRsvp, onCancel, onSelect, dark, isRsvping, isCancelling }: {
  event: ApiEvent; isRsvped: boolean; onRsvp: () => void; onCancel: () => void; onSelect: (e: ApiEvent) => void; dark: boolean; isRsvping?: boolean; isCancelling?: boolean
}) {
  const [hov, setHov] = useState(false)
  const eventDate = new Date(event.event_date)
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const bg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(event)}
      style={{
        background: bg, borderRadius: 16, border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: '16px 18px', display: 'flex', gap: 16, cursor: 'pointer',
        transition: 'transform 0.15s', transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Date block */}
      <div style={{ textAlign: 'center', flexShrink: 0, width: 44 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.orange, lineHeight: 1 }}>{eventDate.getDate()}</div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: C.orange }}>{eventDate.toLocaleString('default', { month: 'short' })}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: dark ? C.darkText : C.charcoal }}>{event.title}</div>
          {event.event_type && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: typeColor + '22', color: typeColor, flexShrink: 0 }}>{event.event_type}</span>}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.tertiary, flexWrap: 'wrap' as const }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock style={{ width: 11, height: 11 }} />{format(eventDate, 'h:mm a')}</span>
          {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Globe style={{ width: 11, height: 11 }} />{event.location}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users style={{ width: 11, height: 11 }} />{event.attendee_count}</span>
        </div>
      </div>
      {isRsvped ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', alignSelf: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '6px 12px', borderRadius: 100 }}>✓ Going</span>
          <button onClick={e => { e.stopPropagation(); onCancel() }} disabled={isCancelling}
            style={{ fontSize: 10, color: C.tertiary, background: 'none', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: isCancelling ? 0.5 : 1 }}>
            {isCancelling ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      ) : (
        <button onClick={e => { e.stopPropagation(); onRsvp() }} disabled={isRsvping}
          style={{ padding: '7px 14px', borderRadius: 100, border: 'none', background: isRsvping ? C.mint : C.orange, color: isRsvping ? C.charcoal : C.white, fontSize: 11, fontWeight: 700, cursor: isRsvping ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', alignSelf: 'center', flexShrink: 0 }}>
          {isRsvping ? 'Saving…' : 'RSVP'}
        </button>
      )}
    </div>
  )
}

// ─── Event Detail View ────────────────────────────────────────────────────────
function EventDetailView({ event, isRsvped, onRsvp, onCancel, onBack, dark, isRsvping, isCancelling }: {
  event: ApiEvent; isRsvped: boolean; onRsvp: () => void; onCancel: () => void; onBack: () => void; dark: boolean; isRsvping?: boolean; isCancelling?: boolean
}) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const cardBg = dark ? '#1A1A1A' : C.white

  return (
    <div style={{ maxWidth: 800 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Events
      </button>

      {/* Hero image */}
      <div style={{ position: 'relative', marginBottom: 48 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', height: 280 }}>
          <EventCover event={event} style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Floating info bar */}
        <div style={{ position: 'absolute', bottom: -36, left: 24, right: 24, background: cardBg, borderRadius: 18, padding: '16px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.14)', border: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.orange, lineHeight: 1 }}>{eventDate.getDate()}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: C.orange }}>{eventDate.toLocaleString('default', { month: 'short' })}</div>
          </div>
          <div style={{ width: 1, height: 36, background: dark ? '#2A2A2A' : C.border }} />
          <div style={{ display: 'flex', flex: 1, gap: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.secondary }}><Clock style={{ width: 14, height: 14, color: C.tertiary }} />{format(eventDate, 'h:mm a')}</span>
            {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.secondary }}><Globe style={{ width: 14, height: 14, color: C.tertiary }} />{event.location}</span>}
            <span style={{ fontSize: 12, color: C.secondary }}><strong>{event.attendee_count}</strong> attending</span>
          </div>
          {!isPast && (
            isRsvped
              ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '9px 18px', borderRadius: 100 }}>✓ Attending</span>
                  <button onClick={onCancel} disabled={isCancelling}
                    style={{ fontSize: 12, color: C.tertiary, background: 'none', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: isCancelling ? 0.5 : 1 }}>
                    {isCancelling ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              : <button onClick={onRsvp} disabled={isRsvping}
                  style={{ padding: '10px 20px', borderRadius: 100, border: 'none', background: isRsvping ? C.mint : C.orange, color: isRsvping ? C.charcoal : C.white, fontSize: 13, fontWeight: 700, cursor: isRsvping ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {isRsvping ? 'Saving…' : 'RSVP ↗'}
                </button>
          )}
        </div>
      </div>

      <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '26px', marginBottom: 20 }}>
        {event.event_type && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: typeColor + '22', color: typeColor, marginBottom: 14, display: 'inline-block' }}>{event.event_type}</span>}
        <div style={{ fontSize: 26, fontWeight: 800, color: dark ? C.darkText : C.charcoal, lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 16 }}>{event.title}</div>
        <Eyebrow label="About this Event" />
        <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.75, margin: 0 }}>{event.description}</p>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${dark ? '#2A2A2A' : C.border}`, fontSize: 13, color: C.secondary }}>
          Organised by <strong style={{ color: dark ? C.darkText : C.charcoal }}>{event.organizer.full_name}</strong>
        </div>
      </div>
    </div>
  )
}

// ─── Create Event Form ─────────────────────────────────────────────────────────
const VALID_TYPES = ['academic', 'social', 'career', 'networking'] as const
type EventType = typeof VALID_TYPES[number]

function CreateEventForm({ onBack, dark }: { onBack: () => void; dark: boolean }) {
  const createEvent = useCreateEvent()
  const [form, setForm] = useState({
    title: '', desc: '', date: '', time: '',
    type: 'networking' as EventType,
    location: '', maxAttendees: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [published, setPublished] = useState(false)

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%', borderRadius: 12,
    border: `1.5px solid ${hasError ? C.orange : (dark ? '#2A2A2A' : C.border)}`,
    padding: '12px 14px', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal, background: dark ? '#161616' : '#FAFAF8',
    outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' as const,
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.desc.trim()) e.desc = 'Description is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (form.location.trim().length < 2) e.location = 'Location must be at least 2 characters'
    if (form.maxAttendees && (isNaN(Number(form.maxAttendees)) || Number(form.maxAttendees) < 1))
      e.maxAttendees = 'Must be a positive number'
    return e
  }

  async function handlePublish() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    const dateTime = `${form.date}T${form.time}:00`
    try {
      await createEvent.mutateAsync({
        title: form.title.trim(),
        description: form.desc.trim(),
        location: form.location.trim(),
        event_date: new Date(dateTime).toISOString(),
        event_type: form.type,          // already lowercase
        max_attendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
      })
      setPublished(true)
      toast.success('Event published!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to publish event'))
    }
  }

  if (published) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>✓</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 10 }}>Event Published!</div>
      <div style={{ fontSize: 15, color: C.secondary, maxWidth: 380 }}>Your event "<strong>{form.title}</strong>" is now live.</div>
      <button onClick={() => { setPublished(false); setForm({ title: '', desc: '', date: '', time: '', type: 'networking', location: '', maxAttendees: '' }) }}
        style={{ marginTop: 24, padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Create Another ↗
      </button>
    </div>
  )

  function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: error ? C.orange : C.secondary, marginBottom: 7 }}>{label}</div>
        {children}
        {error && <div style={{ fontSize: 11, color: C.orange, marginTop: 4 }}>{error}</div>}
      </div>
    )
  }

  const cardBg = dark ? '#1A1A1A' : C.white
  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Events
      </button>
      <div style={{ background: cardBg, borderRadius: 24, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '32px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 24 }}>Create an Event</div>

        <Field label="Event Title" error={errors.title}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Product Design Meetup" style={inputStyle(!!errors.title)} />
        </Field>

        <Field label="Description" error={errors.desc}>
          <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            placeholder="What's this event about?" style={{ ...inputStyle(!!errors.desc), height: 100, resize: 'none' } as React.CSSProperties} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>
          <Field label="Date" error={errors.date}>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle(!!errors.date)} />
          </Field>
          <Field label="Time" error={errors.time}>
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle(!!errors.time)} />
          </Field>
        </div>

        <Field label="Event Type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {VALID_TYPES.map(t => {
              const color = TYPE_COLORS[t] || C.orange
              const active = form.type === t
              return (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${active ? color : (dark ? '#333' : C.border)}`, background: active ? color + '20' : 'transparent', color: active ? color : (dark ? C.darkText : C.charcoal), fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', textTransform: 'capitalize' }}>
                  {t}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Location / Link" error={errors.location}>
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Venue address or meeting link" style={inputStyle(!!errors.location)} />
        </Field>

        <Field label="Max Attendees (optional)" error={errors.maxAttendees}>
          <input type="number" min="1" value={form.maxAttendees}
            onChange={e => setForm(f => ({ ...f, maxAttendees: e.target.value }))}
            placeholder="Leave blank for unlimited" style={inputStyle(!!errors.maxAttendees)} />
        </Field>

        <button onClick={handlePublish} disabled={createEvent.isPending}
          style={{ width: '100%', padding: '15px', borderRadius: 100, border: 'none', background: createEvent.isPending ? C.mint : C.orange, color: createEvent.isPending ? C.charcoal : C.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 6 }}>
          {createEvent.isPending ? 'Publishing…' : 'Publish Event ↗'}
        </button>
      </div>
    </div>
  )
}

// ─── Events Page Content ───────────────────────────────────────────────────────
function EventsPageContent() {
  const { role } = useAuth()
  const { dark } = useDarkMode()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showPast, setShowPast] = useState(false)
  const [selected, setSelected] = useState<ApiEvent | null>(null)
  const [view, setView] = useState<'browse' | 'create'>('browse')

  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useEvents(true)
  const { data: pastEvents = [], isLoading: pastLoading } = useEvents(false)
  const { data: myRsvps = [] } = useMyRsvps()
  const rsvp = useRsvpEvent()
  const cancelRsvp = useCancelRsvp()

  const [rsvpingId, setRsvpingId] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const rsvpedIds = new Set(myRsvps.map(r => r.event_id))
  const canCreate = role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL'

  const now = new Date()
  const weekEnd = addWeeks(now, 1)

  const displayEvents = showPast ? [...upcomingEvents, ...pastEvents] : upcomingEvents

  const filtered = displayEvents.filter(e => {
    if (typeFilter !== 'All' && (e.event_type ?? '').toLowerCase() !== typeFilter.toLowerCase()) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const thisWeek = filtered.filter(e => isThisWeek(new Date(e.event_date)) || (isAfter(new Date(e.event_date), now) && !isAfter(new Date(e.event_date), weekEnd)))
  const later = filtered.filter(e => isAfter(new Date(e.event_date), weekEnd))
  const past = filtered.filter(e => !isAfter(new Date(e.event_date), now))

  // First upcoming event gets featured treatment
  const featured = upcomingEvents[0] ?? null
  const restThisWeek = thisWeek.filter(e => e.id !== featured?.id)

  const isLoading = upcomingLoading || (showPast && pastLoading)

  async function handleRsvp(event: ApiEvent) {
    setRsvpingId(event.id)
    try { await rsvp.mutateAsync(event.id); toast.success('RSVP confirmed!') } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to RSVP'))
    } finally { setRsvpingId(null) }
  }

  async function handleCancel(event: ApiEvent) {
    setCancellingId(event.id)
    try { await cancelRsvp.mutateAsync(event.id); toast.success('RSVP cancelled') } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel RSVP'))
    } finally { setCancellingId(null) }
  }

  if (selected) return (
    <EventDetailView event={selected} isRsvped={rsvpedIds.has(selected.id)} onRsvp={() => handleRsvp(selected)} onCancel={() => handleCancel(selected)} onBack={() => setSelected(null)} dark={dark} isRsvping={rsvpingId === selected.id} isCancelling={cancellingId === selected.id} />
  )

  if (view === 'create') return (
    <CreateEventForm onBack={() => setView('browse')} dark={dark} />
  )

  return (
    <div>
      {/* Search + Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 280, flexWrap: 'wrap' as const }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 100, background: dark ? '#1A1A1A' : C.white, border: `1.5px solid ${dark ? '#333' : C.border}`, flex: '1 1 200px', minWidth: 160 }}>
            <Search style={{ width: 14, height: 14, color: C.tertiary, flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', color: dark ? C.darkText : C.charcoal, flex: 1, minWidth: 0 }}
            />
          </div>
          {/* Type filters */}
          {EVENT_TYPES.map(t => {
            const tColor = TYPE_COLORS[t.toLowerCase()] || C.orange
            const active = typeFilter === t
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${active ? tColor : (dark ? '#333' : C.border)}`, background: active ? tColor + '15' : 'transparent', color: active ? tColor : (dark ? C.darkText : C.charcoal), fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
                {t}
              </button>
            )
          })}
          <button onClick={() => setShowPast(p => !p)}
            style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${showPast ? C.secondary : (dark ? '#333' : C.border)}`, background: showPast ? C.secondary + '15' : 'transparent', color: showPast ? C.secondary : (dark ? C.darkText : C.charcoal), fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
            Past
          </button>
        </div>
        {canCreate && (
          <button onClick={() => setView('create')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
            <Plus style={{ width: 14, height: 14 }} /> Create Event
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: i === 0 ? 220 : 110, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Calendar style={{ width: 32, height: 32, color: C.orange }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No events found</div>
          <div style={{ fontSize: 14, color: C.secondary, marginBottom: 24 }}>
            {search ? `No events match "${search}"` : 'Be the first to host something for the community.'}
          </div>
          {canCreate && (
            <button onClick={() => setView('create')} style={{ padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Create First Event ↗
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* When search/filter active: flat list */}
          {(search || typeFilter !== 'All') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(e => (
                <EventListRow key={e.id} event={e} isRsvped={rsvpedIds.has(e.id)} onRsvp={() => handleRsvp(e)} onCancel={() => handleCancel(e)} onSelect={setSelected} dark={dark} isRsvping={rsvpingId === e.id} isCancelling={cancellingId === e.id} />
              ))}
            </div>
          ) : (
            <>
              {/* Featured event hero */}
              {featured && !showPast && (
                <FeaturedEvent event={featured} isRsvped={rsvpedIds.has(featured.id)} onRsvp={() => handleRsvp(featured)} onCancel={() => handleCancel(featured)} onSelect={setSelected} dark={dark} isRsvping={rsvpingId === featured.id} isCancelling={cancellingId === featured.id} />
              )}

              {/* This week grid */}
              {restThisWeek.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <Eyebrow label="This Week" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {restThisWeek.map(e => (
                      <EventGridCard key={e.id} event={e} isRsvped={rsvpedIds.has(e.id)} onRsvp={() => handleRsvp(e)} onCancel={() => handleCancel(e)} onSelect={setSelected} dark={dark} isRsvping={rsvpingId === e.id} isCancelling={cancellingId === e.id} />
                    ))}
                  </div>
                </div>
              )}

              {/* Later list */}
              {later.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <Eyebrow label="Coming Up" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {later.map(e => (
                      <EventListRow key={e.id} event={e} isRsvped={rsvpedIds.has(e.id)} onRsvp={() => handleRsvp(e)} onCancel={() => handleCancel(e)} onSelect={setSelected} dark={dark} isRsvping={rsvpingId === e.id} isCancelling={cancellingId === e.id} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past events */}
              {showPast && past.length > 0 && (
                <div>
                  <Eyebrow label="Past Events" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.7 }}>
                    {past.map(e => (
                      <EventListRow key={e.id} event={e} isRsvped={rsvpedIds.has(e.id)} onRsvp={() => handleRsvp(e)} onCancel={() => handleCancel(e)} onSelect={setSelected} dark={dark} isRsvping={rsvpingId === e.id} isCancelling={cancellingId === e.id} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function EventsPage() {
  return (
    <DashboardLayout>
      <EventsPageContent />
    </DashboardLayout>
  )
}
