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
  average_rating: number | null
  total_reviews: number
  match_percentage: number | null
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
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
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
  progress_percentage: number
}

export interface MentorshipSession {
  id: number
  relationship_id: number
  scheduled_at: string
  notes: string | null
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  created_at: string
}

export interface MentorshipMilestone {
  id: number
  title: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  sort_order: number
  target_date: string | null
  completed_date: string | null
}

export interface MentorshipResource {
  id: number
  title: string
  category: string
  url: string
  note: string | null
  created_at: string
}

export interface MentorshipReview {
  id: number
  rating: number
  review_text: string | null
  reviewer_name: string
  created_at: string
}

export interface MentorRating {
  user_id: number
  average_rating: number
  total_reviews: number
}

export interface MentorshipStats {
  as_mentee: {
    total_mentors: number
    active_mentors: number
    total_sessions: number
    completed_sessions: number
    pending_requests: number
  }
  as_mentor: {
    total_mentees: number
    active_mentees: number
    total_sessions: number
    pending_requests: number
  }
}

export interface MyMentorResponse {
  relationship_id: number
  mentor_id: number
  mentor: MentorUserSummary & { bio?: string | null; expertise_areas?: string[] }
  goal: string
  meeting_frequency: string
  session_length_minutes: number
  status: string
  started_at: string
  ended_at: string | null
  progress_percentage: number
  milestones: { total: number; completed: number }
  next_session: { id: number; scheduled_at: string } | null
}

export interface MyMenteeResponse {
  relationship_id: number
  mentee_id: number
  mentee: MentorUserSummary
  goal: string
  meeting_frequency: string
  session_length_minutes: number
  status: string
  started_at: string
  ended_at: string | null
  progress_percentage: number
  milestones: { total: number; completed: number }
  next_session: { id: number; scheduled_at: string } | null
}

// ─── Mentor Discovery ─────────────────────────────────────────────────────────

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

export function useMentorPublicProfile(userId?: number) {
  return useQuery({
    queryKey: ['mentor-public', userId],
    enabled: !!userId,
    queryFn: () => api.get<MentorProfile>(`/mentorship/mentors/${userId}`),
  })
}

export function useMentorReviews(userId?: number) {
  return useQuery({
    queryKey: ['mentor-reviews', userId],
    enabled: !!userId,
    queryFn: () => api.get<MentorshipReview[]>(`/mentorship/mentors/${userId}/reviews`),
  })
}

export function useMentorRating(userId?: number) {
  return useQuery({
    queryKey: ['mentor-rating', userId],
    enabled: !!userId,
    queryFn: () => api.get<MentorRating>(`/mentorship/mentors/${userId}/rating`),
  })
}

// ─── My Mentor Profile ────────────────────────────────────────────────────────

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
    }) => {
      const fd = new FormData()
      fd.append('mentor_id', String(data.mentor_id))
      fd.append('goal', data.goal)
      fd.append('meeting_frequency', data.meeting_frequency)
      fd.append('session_length_minutes', String(data.session_length_minutes))
      fd.append('message', data.message)
      return api.postForm<MentorshipRequest>('/mentorship/requests', fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentorship-requests-out'] })
      qc.invalidateQueries({ queryKey: ['my-mentors-rich'] })
    },
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
      qc.invalidateQueries({ queryKey: ['my-mentees-rich'] })
      qc.invalidateQueries({ queryKey: ['mentorship-stats'] })
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentorship-requests-out'] })
      qc.invalidateQueries({ queryKey: ['my-mentors-rich'] })
    },
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

/** Rich version with milestone summary and next session */
export function useMyMentorsRich() {
  return useQuery({
    queryKey: ['my-mentors-rich'],
    queryFn: () => api.get<MyMentorResponse[]>('/mentorship/my-mentors'),
  })
}

/** Rich version with milestone summary and next session */
export function useMyMenteesRich() {
  return useQuery({
    queryKey: ['my-mentees-rich'],
    queryFn: () => api.get<MyMenteeResponse[]>('/mentorship/my-mentees'),
  })
}

export function useEndRelationship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relationshipId: number) =>
      api.patch<MentorshipRelationship>(`/mentorship/relationships/${relationshipId}/end`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-mentors'] })
      qc.invalidateQueries({ queryKey: ['my-mentors-rich'] })
      qc.invalidateQueries({ queryKey: ['my-mentees'] })
      qc.invalidateQueries({ queryKey: ['my-mentees-rich'] })
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
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sessions', vars.relationshipId] })
      qc.invalidateQueries({ queryKey: ['my-mentors-rich'] })
      qc.invalidateQueries({ queryKey: ['my-mentees-rich'] })
    },
  })
}

export function useUpdateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ relationshipId, sessionId, data }: {
      relationshipId: number
      sessionId: number
      data: { scheduled_at?: string; notes?: string; status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' }
    }) =>
      api.patch<MentorshipSession>(
        `/mentorship/relationships/${relationshipId}/sessions/${sessionId}`,
        data
      ),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['sessions', vars.relationshipId] }),
  })
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useMilestones(relationshipId?: number) {
  return useQuery({
    queryKey: ['milestones', relationshipId],
    enabled: !!relationshipId,
    queryFn: () =>
      api.get<MentorshipMilestone[]>(`/mentorship/relationships/${relationshipId}/milestones`),
  })
}

export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ relationshipId, ...data }: {
      relationshipId: number
      title: string
      description?: string
      target_date?: string
    }) =>
      api.post<MentorshipMilestone>(
        `/mentorship/relationships/${relationshipId}/milestones`,
        data
      ),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['milestones', vars.relationshipId] }),
  })
}

export function useUpdateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ milestoneId, relationshipId, ...data }: {
      milestoneId: number
      relationshipId: number
      title?: string
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
      description?: string
      target_date?: string
    }) =>
      api.put<MentorshipMilestone>(`/mentorship/milestones/${milestoneId}`, data),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['milestones', vars.relationshipId] }),
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ milestoneId }: { milestoneId: number; relationshipId: number }) =>
      api.delete(`/mentorship/milestones/${milestoneId}`),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['milestones', vars.relationshipId] }),
  })
}

// ─── Resources ────────────────────────────────────────────────────────────────

export function useResources(relationshipId?: number) {
  return useQuery({
    queryKey: ['resources', relationshipId],
    enabled: !!relationshipId,
    queryFn: () =>
      api.get<MentorshipResource[]>(`/mentorship/relationships/${relationshipId}/resources`),
  })
}

export function useShareResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ relationshipId, ...data }: {
      relationshipId: number
      title: string
      category: string
      url: string
      note?: string
    }) =>
      api.post<MentorshipResource>(
        `/mentorship/relationships/${relationshipId}/resources`,
        data
      ),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['resources', vars.relationshipId] }),
  })
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useLeaveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ relationshipId, rating, review_text }: {
      relationshipId: number
      rating: number
      review_text?: string
    }) =>
      api.post<MentorshipReview>(
        `/mentorship/relationships/${relationshipId}/review`,
        { rating, review_text }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentor-rating'] }),
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useMentorshipStats() {
  return useQuery({
    queryKey: ['mentorship-stats'],
    queryFn: () => api.get<MentorshipStats>('/mentorship/stats/me'),
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
      qc.invalidateQueries({ queryKey: ['my-mentees-rich'] })
      qc.invalidateQueries({ queryKey: ['my-mentors'] })
      qc.invalidateQueries({ queryKey: ['my-mentors-rich'] })
    },
  })
}

/** @deprecated use useSendMentorshipRequest directly */
export function useRequestMentorship() {
  return useSendMentorshipRequest()
}
