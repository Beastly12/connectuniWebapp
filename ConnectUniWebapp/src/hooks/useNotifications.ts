import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  is_read: boolean
  action_url?: string | null
  created_at: string
}

export function useNotifications(userId?: number) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: () => api.get<Notification[]>('/notifications'),
    staleTime: 30_000,
  })

  const unreadCount = (query.data ?? []).filter((n) => !n.is_read).length

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!userId) return
    const wsUrl = api.wsUrl('/notifications/ws')
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as { event: string }
        if (msg.event === 'notification') {
          qc.invalidateQueries({ queryKey: ['notifications', userId] })
        }
      } catch { /* ignore */ }
    }

    return () => ws.close()
  }, [userId, qc])

  const markRead = useMutation({
    mutationFn: (id: number) => api.patch<Notification>(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  })

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    unreadCount,
    markRead,
    markAllRead,
  }
}

export function useUnreadCount(userId?: number) {
  return useQuery({
    queryKey: ['notifications-unread', userId],
    enabled: !!userId,
    queryFn: () => api.get<{ unread_count: number }>('/notifications/unread-count'),
    refetchInterval: 60_000,
  })
}
