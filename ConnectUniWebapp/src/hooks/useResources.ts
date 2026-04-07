/**
 * Mentorship resources are relationship-scoped in the backend.
 * General resource library is not yet a backend endpoint.
 * These hooks stub the interface so ResourcesPage compiles.
 */
import { useQuery } from '@tanstack/react-query'

export interface Resource {
  id: number
  uploaded_by: number
  title: string
  description?: string
  url: string
  category: string
  file_type?: string
  created_at: string
  uploader?: { id: number; user_id: number; full_name: string; avatar_url?: string }
}

export function useResources(_category?: string) {
  return useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
  })
}

export function useCreateResource() {
  return {
    mutateAsync: async (_data: unknown) => { throw new Error('Not implemented') },
    isPending: false,
  }
}
