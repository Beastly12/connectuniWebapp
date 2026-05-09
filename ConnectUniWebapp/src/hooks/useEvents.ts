import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface EventOrganizer {
  id: number
  full_name: string
}

export interface ApiEvent {
  id: number
  organizer_id: number
  organizer: EventOrganizer
  title: string
  description: string
  location: string
  event_date: string
  event_type: string
  max_attendees: number | null
  is_active: boolean
  cover_image_url: string | null
  cover_image_public_id: string | null
  attendee_count: number
  created_at: string
}

export interface EventRegistration {
  id: number
  event_id: number
  user_id: number
  registered_at: string
}

export function useEvents(upcoming = true) {
  return useQuery({
    queryKey: ['events', { upcoming }],
    queryFn: () =>
      upcoming
        ? api.get<ApiEvent[]>('/events/')
        : api.get<ApiEvent[]>('/events/past'),
  })
}

export function useMyRsvps() {
  return useQuery({
    queryKey: ['event-rsvps'],
    queryFn: () => api.get<EventRegistration[]>('/events/rsvps'),
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      description: string
      location: string
      event_date: string
      event_type: string
      max_attendees?: number
    }) => {
      const fd = new FormData()

      fd.append('title', data.title)
      fd.append('description', data.description)
      fd.append('location', data.location)
      fd.append('event_date', data.event_date)
      fd.append('event_type', data.event_type)

      if (data.max_attendees !== undefined) {
        fd.append('max_attendees', String(data.max_attendees))
      }

      return api.postForm<ApiEvent>('/events/', fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useRsvpEvent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) =>
      api.post<EventRegistration>(`/events/${eventId}/rsvp`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['event-rsvps'] })
    },
  })
}

export function useCancelRsvp() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (eventId: number) =>
      api.delete(`/events/${eventId}/rsvp`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['event-rsvps'] })
    },
  })
}