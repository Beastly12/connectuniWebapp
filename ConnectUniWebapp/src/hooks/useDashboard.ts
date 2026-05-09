import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface DashboardStats {
  messages_unread: number
  upcoming_events: number
  upcoming_sessions: Array<{
    id: number
    mentor_name?: string
    mentee_name?: string
    scheduled_at: string
    duration_minutes: number
  }>
}

export interface ActivityItem {
  id: number
  type: string
  actor_name: string
  actor_id: number
  description: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface ProfileCompletion {
  percentage: number
  missing_fields: string[]
  completed_fields: string[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  })
}

export function useActivityFeed(limit = 10) {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: () => api.get<ActivityItem[]>('/activity/me', { limit }),
  })
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: ['profile-completion'],
    queryFn: () => api.get<ProfileCompletion>('/profiles/me/completion'),
  })
}
