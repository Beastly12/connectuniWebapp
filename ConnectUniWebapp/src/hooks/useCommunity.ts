import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Community {
  id: number
  name: string
  description: string | null
  type: string
  university: string | null
  is_private: boolean
  is_active: boolean
  cover_image_url: string | null
  creator_id: number
  member_count: number
  created_at: string
}

export interface CommunityMember {
  user_id: number
  full_name: string
  role: string
  joined_at: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  reacted: boolean
}

export interface CommunityMessage {
  id: number
  community_id: number
  sender_id: number
  sender: {
    id: number
    full_name: string
    avatar_url: string | null
  }
  sender_avatar_url: string | null
  content: string | null
  reply_to_id: number | null
  attachments: { id: number; file_url: string; file_name: string; file_type: string }[]
  reactions: ReactionSummary[]
  created_at: string
}

// ─── Communities ──────────────────────────────────────────────────────────────

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: () => api.get<Community[]>('/communities'),
  })
}

export function useMyCommunities() {
  return useQuery({
    queryKey: ['communities', 'me'],
    queryFn: () => api.get<Community[]>('/communities/me'),
  })
}

export function useCommunity(communityId?: number) {
  return useQuery({
    queryKey: ['community', communityId],
    enabled: !!communityId,
    queryFn: () => api.get<Community>(`/communities/${communityId}`),
  })
}

export function useCreateCommunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      type?: string
      university?: string
      is_private?: boolean
    }) => api.post<Community>('/communities', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  })
}

export function useJoinCommunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (communityId: number) =>
      api.post<CommunityMember>(`/communities/${communityId}/join`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  })
}

export function useLeaveCommunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (communityId: number) => api.delete(`/communities/${communityId}/leave`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  })
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useCommunityMessages(communityId?: number, page = 1) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['community-messages', communityId, page],
    enabled: !!communityId,
    queryFn: () =>
      api.get<CommunityMessage[]>(`/communities/${communityId}/messages`, { page, limit: 50 }),
  })

  // WebSocket for real-time messages
  useEffect(() => {
    if (!communityId) return
    const wsUrl = api.wsUrl(`/communities/${communityId}/ws`)
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as { event: string }
        if (msg.event === 'new_message' || msg.event === 'reaction_update') {
          qc.invalidateQueries({ queryKey: ['community-messages', communityId] })
        }
      } catch { /* ignore */ }
    }

    return () => ws.close()
  }, [communityId, qc])

  return query
}

export function useSendCommunityMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      communityId,
      content,
      replyToId,
      files,
    }: {
      communityId: number
      content?: string
      replyToId?: number
      files?: File[]
    }) => {
      const fd = new FormData()
      if (content) fd.append('content', content)
      if (replyToId) fd.append('reply_to_id', String(replyToId))
      files?.forEach((f) => fd.append('files', f))
      return api.postForm<CommunityMessage>(`/communities/${communityId}/messages`, fd)
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['community-messages', vars.communityId] }),
  })
}

export function useToggleReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      communityId,
      messageId,
      emoji,
    }: {
      communityId: number
      messageId: number
      emoji: string
    }) =>
      api.post<ReactionSummary[]>(
        `/communities/${communityId}/messages/${messageId}/reactions`,
        { emoji }
      ),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['community-messages', vars.communityId] }),
  })
}
