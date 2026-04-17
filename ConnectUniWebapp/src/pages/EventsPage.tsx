import { useState } from 'react'
import { Calendar, MapPin, Users, PlusCircle, Clock, Video, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useEvents, useCreateEvent, useRsvpEvent, useCancelRsvp, useMyRsvps } from '@/hooks/useEvents'
import type { ApiEvent } from '@/hooks/useEvents'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

function EventCard({
  event,
  isRsvped,
  loading,
  onRsvp,
  onCancel,
}: {
  event: ApiEvent
  isRsvped: boolean
  loading: boolean
  onRsvp: () => void
  onCancel: () => void
}) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  const isVirtual =
    event.location?.toLowerCase() === 'virtual' ||
    event.event_type?.toLowerCase() === 'virtual' ||
    event.event_type?.toLowerCase() === 'online'

  const typeBadgeStyle: Record<string, string> = {
    academic: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    social: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    career: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    networking: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }

  return (
    <div className={cn(
      'glass-card rounded-xl p-4 transition-all duration-200',
      !isPast && 'hover:border-primary/25 hover:shadow-glow-sm'
    )}>
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl gradient-primary-subtle border border-primary/20 w-12 py-2 px-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">
            {format(eventDate, 'MMM')}
          </span>
          <span className="text-xl font-bold leading-none text-primary">{format(eventDate, 'd')}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold leading-snug truncate">{event.title}</h3>
              {event.description && (
                <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">{event.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isVirtual && (
                <Badge className="gap-1 text-[10px] h-5 px-1.5 bg-blue-500/15 text-blue-400 border-blue-500/20">
                  <Video className="h-2.5 w-2.5" />
                  Virtual
                </Badge>
              )}
              {event.event_type && !['virtual', 'online', 'in-person', 'hybrid'].includes(event.event_type.toLowerCase()) && (
                <Badge className={cn('capitalize text-[10px] h-5 px-1.5', typeBadgeStyle[event.event_type.toLowerCase()] ?? 'bg-muted/60 text-muted-foreground border-border/40')}>
                  {event.event_type}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(eventDate, 'h:mm a')}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
            {event.max_attendees && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.attendee_count}/{event.max_attendees}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-muted-foreground/60">by {event.organizer_name}</span>
            {!isPast ? (
              <Button
                size="sm"
                disabled={loading}
                className={cn(
                  'h-7 px-3 text-xs font-semibold transition-all min-w-[90px]',
                  isRsvped
                    ? 'border-border/50 text-muted-foreground bg-muted/50'
                    : 'gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90',
                  loading && 'opacity-70 cursor-not-allowed'
                )}
                variant={isRsvped ? 'outline' : 'default'}
                onClick={isRsvped ? onCancel : onRsvp}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {isRsvped ? 'Cancelling…' : 'RSVPing…'}
                  </span>
                ) : isRsvped ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" />
                    Cancel RSVP
                  </span>
                ) : 'RSVP'}
              </Button>
            ) : (
              <Badge className="text-[10px] h-5 px-1.5 bg-muted/40 text-muted-foreground/60 border-border/30">
                Past
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type LocationMode = 'virtual' | 'in-person' | 'hybrid'
type EventCategory = 'academic' | 'social' | 'career' | 'networking'

function CreateEventDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createEvent = useCreateEvent()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [locationError, setLocationError] = useState('')
  const [validatingLocation, setValidatingLocation] = useState(false)
  const [locationMode, setLocationMode] = useState<LocationMode>('in-person')
  const [eventType, setEventType] = useState<EventCategory>('academic')

  function handleLocationModeChange(mode: LocationMode) {
    setLocationMode(mode)
    setLocationError('')
    if (mode === 'virtual') setLocation('')
  }

  async function validateLocation(value: string): Promise<boolean> {
    if (!value.trim()) {
      setLocationError('Please enter a location.')
      return false
    }
    setValidatingLocation(true)
    setLocationError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'ConnectUni/1.0' } }
      )
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setLocationError('Location not recognised. Enter a real place (e.g. "Harvard University" or "London, UK").')
        setValidatingLocation(false)
        return false
      }
    } catch {
      // Network failure — allow through rather than block the user
    }
    setValidatingLocation(false)
    return true
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title || !date || !time) return

    if (locationMode !== 'virtual') {
      const valid = await validateLocation(location)
      if (!valid) return
    }

    const finalLocation = locationMode === 'virtual' ? 'Virtual' : location

    try {
      await createEvent.mutateAsync({
        title,
        description,
        location: finalLocation,
        event_date: `${date}T${time}:00`,
        event_type: eventType,
      })
      toast.success('Event created!')
      onOpenChange(false)
      setTitle(''); setDescription(''); setDate(''); setTime('')
      setLocation(''); setLocationMode('in-person'); setEventType('academic')
    } catch {
      toast.error('Failed to create event')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title <span className="text-destructive">*</span></Label>
            <Input className="h-9 bg-muted/50 border-border/50" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Event name" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea className="text-sm resize-none bg-muted/50 border-border/50" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What is this event about?" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date <span className="text-destructive">*</span></Label>
              <Input className="h-9 bg-muted/50 border-border/50" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Time <span className="text-destructive">*</span></Label>
              <Input className="h-9 bg-muted/50 border-border/50" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          {/* Event type (category) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Type <span className="text-destructive">*</span></Label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventCategory)}
              className="flex h-9 w-full rounded-lg border border-border/50 bg-muted/50 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="career">Career</option>
              <option value="networking">Networking</option>
            </select>
          </div>

          {/* Location format */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Format <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['virtual', 'in-person', 'hybrid'] as LocationMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleLocationModeChange(mode)}
                  className={cn(
                    'h-8 rounded-lg border text-xs font-medium capitalize transition-all',
                    locationMode === mode
                      ? 'gradient-primary border-0 text-white shadow-glow-sm'
                      : 'border-border/50 bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Location input — only for non-virtual */}
          {locationMode !== 'virtual' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">must be a real place</span>
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className={cn(
                    'h-9 pl-8 bg-muted/50 border-border/50 pr-8',
                    locationError && 'border-destructive/60 focus-visible:ring-destructive/40'
                  )}
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setLocationError('') }}
                  onBlur={() => { if (location.trim()) validateLocation(location) }}
                  placeholder={locationMode === 'hybrid' ? 'e.g. Harvard University, Cambridge' : 'e.g. Boston Convention Center'}
                  required
                />
                {validatingLocation && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" size="sm" type="button" className="border-border/50" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              size="sm"
              type="submit"
              disabled={createEvent.isPending || validatingLocation || !!locationError}
              className="gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createEvent.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Creating…
                </span>
              ) : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function EventsPage() {
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')
  const [createOpen, setCreateOpen] = useState(false)
  const { data: events = [], isLoading } = useEvents(filter === 'upcoming')
  const { data: myRsvps = [] } = useMyRsvps()
  const rsvp = useRsvpEvent()
  const cancelRsvp = useCancelRsvp()

  const rsvpedIds = new Set(myRsvps.map((r) => r.event_id))

  async function handleRsvp(eventId: number) {
    try {
      await rsvp.mutateAsync(eventId)
    } catch {
      toast.error('Failed to RSVP')
    }
  }

  async function handleCancel(eventId: number) {
    try {
      await cancelRsvp.mutateAsync(eventId)
    } catch {
      toast.error('Failed to cancel RSVP')
    }
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-full">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-to) / 0.12), transparent 70%)' }}
        />

        <div className="relative p-6 space-y-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md gradient-primary">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Events</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Events</h1>
              <p className="mt-1 text-sm text-muted-foreground">Networking events, workshops, and more</p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              size="sm"
              className="h-9 text-xs font-semibold gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Create
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 p-0.5 bg-muted/50 border border-border/40 rounded-lg w-fit">
            {(['upcoming', 'all'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                  filter === f
                    ? 'gradient-primary text-white shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'upcoming' ? 'Upcoming' : 'All Events'}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-border/40 bg-muted/10">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
                  <Calendar className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">No events found</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Be the first to create one</p>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs gradient-primary border-0 text-white shadow-glow-sm hover:opacity-90"
                  onClick={() => setCreateOpen(true)}
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  Create event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRsvped={rsvpedIds.has(event.id)}
                  loading={
                    (rsvp.isPending && rsvp.variables === event.id) ||
                    (cancelRsvp.isPending && cancelRsvp.variables === event.id)
                  }
                  onRsvp={() => handleRsvp(event.id)}
                  onCancel={() => handleCancel(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
    </DashboardLayout>
  )
}
