import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: number
  other_user_id: number
  other_user_name: string
  other_user_avatar: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
}

export interface DirectMessage {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  image_url: string | null
  is_read: boolean
  created_at: string
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<Conversation[]>('/conversations'),
  })
}

export function useConversationMessages(conversationId?: number) {
  return useQuery({
    queryKey: ['direct-messages', conversationId],
    enabled: !!conversationId,
    queryFn: () =>
      api.get<DirectMessage[]>(`/conversations/${conversationId}/messages`, {
        limit: 50,
        offset: 0,
      }),
  })
}

// Start or retrieve a conversation with another user (idempotent)
export function useStartConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (otherUserId: number) =>
      api.post<Conversation>('/conversations', { other_user_id: otherUserId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useSendDirectMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      api.post<DirectMessage>(`/conversations/${conversationId}/messages`, { content }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['direct-messages', vars.conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
