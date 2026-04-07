/**
 * Careers/Jobs router is not yet implemented in the ConnectUni backend
 * (models exist but no router registered). These hooks return empty data
 * as stubs so the CareersPage compiles without errors.
 */
import { useQuery } from '@tanstack/react-query'

export interface Job {
  id: number
  posted_by: number
  title: string
  company: string
  location?: string
  job_type: string
  description: string
  salary_range?: string
  apply_url?: string
  deadline?: string
  created_at: string
}

export interface JobApplication {
  id: number
  job_id: number
  applicant_id: number
  status: string
  cover_letter?: string
  applied_at: string
  job?: Job
}

export function useJobs(_filters?: { type?: string; search?: string }) {
  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
  })
}

export function useCreateJob() {
  return {
    mutateAsync: async (_data: unknown) => { throw new Error('Not implemented') },
    isPending: false,
  }
}

export function useApplyJob() {
  return {
    mutateAsync: async (_data: unknown) => { throw new Error('Not implemented') },
    isPending: false,
  }
}

export function useMyApplications(_userId?: number) {
  return useQuery<JobApplication[]>({
    queryKey: ['applications'],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
  })
}
