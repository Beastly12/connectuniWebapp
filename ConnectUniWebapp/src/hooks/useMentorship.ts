import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, api } from '@/lib/api'

// ─── Types (matching backend response shapes) ─────────────────────────────────

export interface MentorUserSummary {
  id: number
  full_name: string
  university_name: string
}

export interface MentorProfile {
  id: number
  user_id: number
  user: MentorUserSummary
  bio: string | null
  linkedin_url: string | null
  expertise_areas: string[]
  mentorship_goals: string[]
  availability_slots: Record<string, unknown>[] | null
  max_mentees: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MentorshipRequest {
  id: number
  mentee_id: number
  mentor_id: number
  mentee: MentorUserSummary
  mentor: MentorUserSummary
  goal: string
  meeting_frequency: string
  session_length_minutes: number
  message: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  created_at: string
}

export interface MentorshipRelationship {
  id: number
  mentor_id: number
  mentee_id: number
  mentor: MentorUserSummary
  mentee: MentorUserSummary
  goal: string
  meeting_frequency: string
  session_length_minutes: number
  status: 'ACTIVE' | 'ENDED'
  started_at: string
  ended_at: string | null
}

export interface MentorshipSession {
  id: number
  relationship_id: number
  scheduled_at: string
  notes: string | null
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  created_at: string
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMentors(filters?: { skills?: string; goals?: string; university?: string }) {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: () =>
      api.get<MentorProfile[]>('/mentorship/mentors', {
        skills: filters?.skills,
        goals: filters?.goals,
        university: filters?.university,
      }),
  })
}

export function useMyMentorProfile() {
  return useQuery({
    queryKey: ['mentor-profile-me'],
    queryFn: () => api.get<MentorProfile>('/mentorship/mentor-profile/me'),
    retry: false,
  })
}

export function useBecomeMentor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      bio?: string
      linkedin_url?: string
      expertise_areas?: string[]
      mentorship_goals?: string[]
      max_mentees?: number
    }) => api.post<MentorProfile>('/mentorship/become-mentor', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-profile-me'] })
      qc.invalidateQueries({ queryKey: ['mentors'] })
    },
  })
}

export function useEnsureMentorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      bio?: string
      linkedin_url?: string
      expertise_areas?: string[]
      mentorship_goals?: string[]
      max_mentees?: number
    }) => {
      try {
        return await api.get<MentorProfile>('/mentorship/mentor-profile/me')
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return api.post<MentorProfile>('/mentorship/become-mentor', data)
        }

        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-profile-me'] })
      qc.invalidateQueries({ queryKey: ['mentors'] })
    },
  })
}

export function useUpdateMentorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{
      bio: string
      linkedin_url: string
      expertise_areas: string[]
      mentorship_goals: string[]
      max_mentees: number
    }>) => api.patch<MentorProfile>('/mentorship/mentor-profile/me', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentor-profile-me'] }),
  })
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export function useOutgoingRequests() {
  return useQuery({
    queryKey: ['mentorship-requests-out'],
    queryFn: () => api.get<MentorshipRequest[]>('/mentorship/requests/outgoing'),
  })
}

export function useIncomingRequests() {
  return useQuery({
    queryKey: ['mentorship-requests-in'],
    queryFn: () => api.get<MentorshipRequest[]>('/mentorship/requests/incoming'),
  })
}

export function useSendMentorshipRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      mentor_id: number
      goal: string
      meeting_frequency: string
      session_length_minutes: number
      message: string
    }) => api.post<MentorshipRequest>('/mentorship/requests', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorship-requests-out'] }),
  })
}

export function useAcceptRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) =>
      api.patch<MentorshipRequest>(`/mentorship/requests/${requestId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentorship-requests-in'] })
      qc.invalidateQueries({ queryKey: ['my-mentees'] })
    },
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) =>
      api.patch<MentorshipRequest>(`/mentorship/requests/${requestId}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorship-requests-in'] }),
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) => api.delete(`/mentorship/requests/${requestId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorship-requests-out'] }),
  })
}

// ─── Relationships ─────────────────────────────────────────────────────────────

export function useMyMentees() {
  return useQuery({
    queryKey: ['my-mentees'],
    queryFn: () => api.get<MentorshipRelationship[]>('/mentorship/relationships/my-mentees'),
  })
}

export function useMyMentors() {
  return useQuery({
    queryKey: ['my-mentors'],
    queryFn: () => api.get<MentorshipRelationship[]>('/mentorship/relationships/my-mentors'),
  })
}

export function useEndRelationship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relationshipId: number) =>
      api.patch<MentorshipRelationship>(`/mentorship/relationships/${relationshipId}/end`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-mentors'] })
      qc.invalidateQueries({ queryKey: ['my-mentees'] })
    },
  })
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function useSessions(relationshipId: number | undefined) {
  return useQuery({
    queryKey: ['sessions', relationshipId],
    enabled: !!relationshipId,
    queryFn: () =>
      api.get<MentorshipSession[]>(`/mentorship/relationships/${relationshipId}/sessions`),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ relationshipId, scheduled_at, notes }: {
      relationshipId: number
      scheduled_at: string
      notes?: string
    }) =>
      api.post<MentorshipSession>(
        `/mentorship/relationships/${relationshipId}/sessions`,
        { scheduled_at, notes }
      ),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['sessions', vars.relationshipId] }),
  })
}

// ─── Compatibility aliases (keep old page imports working) ────────────────────

/** @deprecated use useMyMentors / useMyMentees directly */
export function useMentorships(_userId: number | undefined, role: 'mentor' | 'mentee') {
  const mentees = useMyMentees()
  const mentors = useMyMentors()
  return role === 'mentor' ? mentees : mentors
}

/** @deprecated use useAcceptRequest / useRejectRequest directly */
export function useUpdateMentorshipStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'declined' | 'completed' }) => {
      if (status === 'active') return api.patch(`/mentorship/requests/${id}/accept`)
      if (status === 'declined') return api.patch(`/mentorship/requests/${id}/reject`)
      return api.patch(`/mentorship/relationships/${id}/end`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentorship-requests-in'] })
      qc.invalidateQueries({ queryKey: ['my-mentees'] })
      qc.invalidateQueries({ queryKey: ['my-mentors'] })
    },
  })
}

/** @deprecated use useSendMentorshipRequest directly */
export function useRequestMentorship() {
  return useSendMentorshipRequest()
}
