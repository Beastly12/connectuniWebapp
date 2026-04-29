import { useState } from 'react'
import { Clock, MapPin, Users, ChevronLeft, Plus, ArrowUpRight, Globe, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout, C, useDarkMode } from '@/components/layouts/DashboardLayout'
import { useEvents, useMyRsvps, useCreateEvent, useRsvpEvent, useCancelRsvp } from '@/hooks/useEvents'
import type { ApiEvent } from '@/hooks/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { format } from 'date-fns'

const TYPE_COLORS: Record<string, string> = {
  networking: C.orange,
  career: '#6B7FA3',
  academic: '#8B6FA8',
  social: C.mint,
  virtual: '#4A5AA8',
  online: '#4A5AA8',
}

const EVENT_TYPES = ['All', 'Academic', 'Social', 'Career', 'Networking']

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

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({
  event, isRsvped, rsvpLoading, cancelLoading, onRsvp, onCancel, onSelect, dark,
}: {
  event: ApiEvent
  isRsvped: boolean
  rsvpLoading: boolean
  cancelLoading: boolean
  onRsvp: () => void
  onCancel: () => void
  onSelect: (e: ApiEvent) => void
  dark: boolean
}) {
  const [hov, setHov] = useState(false)
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const day = eventDate.getDate().toString().padStart(2, '0')
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const bg = dark ? '#1A1A1A' : C.white

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(event)}
      style={{
        background: bg, borderRadius: 20,
        border: `1px solid ${dark ? '#2A2A2A' : C.border}`,
        padding: '20px 22px', display: 'flex', gap: 20,
        cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 10px 28px rgba(0,0,0,${dark ? 0.3 : 0.08})` : 'none',
      }}
    >
      {/* Date block */}
      <div style={{ textAlign: 'center', flexShrink: 0, width: 52 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: !isPast ? C.orange : C.tertiary, lineHeight: 1, letterSpacing: '-0.02em' }}>{day}</div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: !isPast ? C.orange : C.tertiary, marginTop: 2 }}>{month}</div>
        <div style={{ width: 32, height: 2, background: !isPast ? C.orange : C.border, borderRadius: 1, margin: '8px auto 0' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: dark ? C.darkText : C.charcoal, lineHeight: 1.25 }}>{event.title}</div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
            {event.event_type && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: typeColor + '22', color: typeColor }}>
                {event.event_type}
              </span>
            )}
            {isPast && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: dark ? '#2A2A2A' : '#F0EDE6', color: C.tertiary }}>Past</span>
            )}
          </div>
        </div>
        <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.55, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' as const }}>
          {event.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.tertiary }}>
              <Clock style={{ width: 12, height: 12 }} />{format(eventDate, 'h:mm a')}
            </span>
            {event.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.tertiary }}>
                <MapPin style={{ width: 12, height: 12 }} />{event.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.tertiary }}>
              <Users style={{ width: 12, height: 12 }} />{event.attendee_count}
            </span>
            <span style={{ fontSize: 12, color: C.tertiary }}>by <span style={{ fontWeight: 600, color: dark ? '#C0C0C0' : C.secondary }}>{event.organizer_name}</span></span>
          </div>
          {!isPast && (
            isRsvped
              ? <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '6px 14px', borderRadius: 100 }}>✓ Attending</span>
                  <button onClick={e => { e.stopPropagation(); onCancel() }} disabled={cancelLoading} style={{ fontSize: 11, color: C.tertiary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cancel</button>
                </div>
              : <button
                  onClick={e => { e.stopPropagation(); onRsvp() }}
                  disabled={rsvpLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  RSVP <ArrowUpRight style={{ width: 10, height: 10 }} />
                </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Event Detail View ────────────────────────────────────────────────────────
function EventDetailView({ event, isRsvped, onRsvp, onCancel, onBack, dark }: {
  event: ApiEvent
  isRsvped: boolean
  onRsvp: () => void
  onCancel: () => void
  onBack: () => void
  dark: boolean
}) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const day = eventDate.getDate().toString().padStart(2, '0')
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()
  const typeKey = (event.event_type ?? '').toLowerCase()
  const typeColor = TYPE_COLORS[typeKey] ?? C.secondary
  const cardBg = dark ? '#1A1A1A' : C.white

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Events
      </button>

      <div style={{ position: 'relative', marginBottom: 48 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', height: 260 }}>
          <PhotoPlaceholder tint={typeKey === 'networking' ? 'warm' : 'cool'} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ position: 'absolute', bottom: -36, left: 28, right: 28, background: cardBg, borderRadius: 20, padding: '18px 22px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: `1px solid ${dark ? '#2A2A2A' : C.border}`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.orange, lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.orange }}>{month}</div>
          </div>
          <div style={{ width: 1, height: 40, background: dark ? '#2A2A2A' : C.border }} />
          <div style={{ display: 'flex', flex: 1, gap: 20, flexWrap: 'wrap' as const, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.secondary }}>
              <Clock style={{ width: 14, height: 14, color: C.tertiary }} />{format(eventDate, 'h:mm a')}
            </span>
            {event.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.secondary }}>
                <Globe style={{ width: 14, height: 14, color: C.tertiary }} />{event.location}
              </span>
            )}
            <span style={{ fontSize: 12, color: C.secondary }}><strong>{event.attendee_count}</strong> attending</span>
          </div>
          {!isPast && (
            isRsvped
              ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#3A8A30', background: C.mint, padding: '9px 18px', borderRadius: 100 }}>✓ Attending</span>
                  <button onClick={onCancel} style={{ fontSize: 12, color: C.tertiary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cancel</button>
                </div>
              : <button onClick={onRsvp} style={{ padding: '10px 20px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  RSVP ↗
                </button>
          )}
        </div>
      </div>

      <div style={{ background: cardBg, borderRadius: 22, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {event.event_type && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: typeColor + '22', color: typeColor }}>{event.event_type}</span>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: dark ? C.darkText : C.charcoal, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 16 }}>{event.title}</div>
        <Eyebrow label="About this Event" />
        <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.7 }}>{event.description}</p>
      </div>
    </div>
  )
}

// ─── Create Event Form ─────────────────────────────────────────────────────────
function CreateEventForm({ onBack, dark }: { onBack: () => void; dark: boolean }) {
  const createEvent = useCreateEvent()
  const [form, setForm] = useState({ title: '', desc: '', date: '', time: '', type: 'Networking', location: '' })
  const [published, setPublished] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 12,
    border: `1.5px solid ${dark ? '#2A2A2A' : C.border}`,
    padding: '12px 14px', fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: dark ? C.darkText : C.charcoal,
    background: dark ? '#161616' : '#FAFAF8',
    outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' as const,
  }

  async function handlePublish() {
    if (!form.title || !form.date) { toast.error('Please fill in title and date'); return }
    const dateTime = form.time ? `${form.date}T${form.time}:00` : `${form.date}T00:00:00`
    try {
      await createEvent.mutateAsync({
        title: form.title,
        description: form.desc,
        location: form.location,
        event_date: new Date(dateTime).toISOString(),
        event_type: form.type,
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
      <button onClick={() => { setPublished(false); setForm({ title: '', desc: '', date: '', time: '', type: 'Networking', location: '' }) }} style={{ marginTop: 24, padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Create Another ↗</button>
    </div>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.secondary, marginBottom: 7, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </div>
  )

  const Divider = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 22px' }}>
      <div style={{ flex: 1, height: 1.5, background: dark ? '#2A5A2A' : '#C8E8A8', borderRadius: 2 }} />
      <Eyebrow label={label} />
      <div style={{ flex: 1, height: 1.5, background: dark ? '#2A5A2A' : '#C8E8A8', borderRadius: 2 }} />
    </div>
  )

  const cardBg = dark ? '#1A1A1A' : C.white

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.secondary, fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Events
      </button>
      <div style={{ background: cardBg, borderRadius: 24, border: `1px solid ${dark ? '#2A2A2A' : C.border}`, padding: '32px' }}>
        <Divider label="Basics" />
        <Field label="Event Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Product Design Meetup" style={inputStyle} /></Field>
        <Field label="Description"><textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="What's this event about?" style={{ ...inputStyle, height: 100, resize: 'none' } as React.CSSProperties} /></Field>
        <Divider label="When" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Date"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></Field>
          <Field label="Time"><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} /></Field>
        </div>
        <Divider label="Type" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 18 }}>
          {['Academic', 'Social', 'Career', 'Networking'].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${form.type === t ? (TYPE_COLORS[t.toLowerCase()] || C.orange) : (dark ? '#333' : C.border)}`, background: form.type === t ? (TYPE_COLORS[t.toLowerCase()] || C.orange) + '15' : 'transparent', color: form.type === t ? (TYPE_COLORS[t.toLowerCase()] || C.orange) : (dark ? C.darkText : C.charcoal), fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t}</button>
          ))}
        </div>
        <Divider label="Location" />
        <Field label="Venue / Link"><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue address or meeting link" style={inputStyle} /></Field>
        <button onClick={handlePublish} disabled={createEvent.isPending} style={{ width: '100%', marginTop: 12, padding: '16px', borderRadius: 100, border: 'none', background: createEvent.isPending ? C.mint : C.orange, color: createEvent.isPending ? C.charcoal : C.white, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
  const [statusFilter, setStatusFilter] = useState<'Upcoming' | 'All'>('Upcoming')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selected, setSelected] = useState<ApiEvent | null>(null)
  const [view, setView] = useState<'browse' | 'create'>('browse')

  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useEvents(true)
  const { data: pastEvents = [], isLoading: pastLoading } = useEvents(false)
  const { data: myRsvps = [] } = useMyRsvps()
  const rsvp = useRsvpEvent()
  const cancelRsvp = useCancelRsvp()

  const rsvpedIds = new Set(myRsvps.map(r => r.event_id))

  const allEvents = [...upcomingEvents, ...pastEvents]
  const displayEvents = statusFilter === 'Upcoming' ? upcomingEvents : allEvents

  const filtered = displayEvents.filter(e => {
    if (typeFilter === 'All') return true
    return (e.event_type ?? '').toLowerCase() === typeFilter.toLowerCase()
  })

  const isLoading = upcomingLoading || (statusFilter === 'All' && pastLoading)
  const canCreate = role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL'

  async function handleRsvp(event: ApiEvent) {
    try {
      await rsvp.mutateAsync(event.id)
      toast.success('RSVP confirmed!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to RSVP'))
    }
  }

  async function handleCancel(event: ApiEvent) {
    try {
      await cancelRsvp.mutateAsync(event.id)
      toast.success('RSVP cancelled')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel RSVP'))
    }
  }

  if (selected) return (
    <EventDetailView
      event={selected}
      isRsvped={rsvpedIds.has(selected.id)}
      onRsvp={() => handleRsvp(selected)}
      onCancel={() => handleCancel(selected)}
      onBack={() => setSelected(null)}
      dark={dark}
    />
  )

  if (view === 'create') return (
    <CreateEventForm onBack={() => setView('browse')} dark={dark} />
  )

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {(['Upcoming', 'All'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${statusFilter === s ? C.orange : (dark ? '#333' : C.border)}`, background: statusFilter === s ? C.orange : 'transparent', color: statusFilter === s ? C.white : (dark ? C.darkText : C.charcoal), fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s}</button>
          ))}
          <div style={{ width: 1, background: dark ? '#333' : C.border, margin: '0 4px' }} />
          {EVENT_TYPES.map(t => {
            const tColor = TYPE_COLORS[t.toLowerCase()] || C.orange
            const active = typeFilter === t
            return (
              <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${active ? (tColor) : (dark ? '#333' : C.border)}`, background: active ? tColor + '15' : 'transparent', color: active ? tColor : (dark ? C.darkText : C.charcoal), fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t}</button>
            )
          })}
        </div>
        {canCreate && (
          <button onClick={() => setView('create')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
            <Plus style={{ width: 14, height: 14 }} /> Create Event
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 120, borderRadius: 20, background: dark ? '#1A1A1A' : '#F0EDE6' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: dark ? '#2A2A2A' : '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Calendar style={{ width: 36, height: 36, color: C.orange }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: dark ? C.darkText : C.charcoal, marginBottom: 8 }}>No events yet</div>
          <div style={{ fontSize: 14, color: C.secondary, marginBottom: 24 }}>Be the first to host something for the community.</div>
          {canCreate && (
            <button onClick={() => setView('create')} style={{ padding: '12px 28px', borderRadius: 100, border: 'none', background: C.orange, color: C.white, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Create First Event ↗
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(e => (
            <EventCard
              key={e.id}
              event={e}
              isRsvped={rsvpedIds.has(e.id)}
              rsvpLoading={rsvp.isPending}
              cancelLoading={cancelRsvp.isPending}
              onRsvp={() => handleRsvp(e)}
              onCancel={() => handleCancel(e)}
              onSelect={setSelected}
              dark={dark}
            />
          ))}
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
