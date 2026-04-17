import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: number
  user_id: number
  university_name: string
  course_title: string
  year_of_study: number
  expected_graduation: number
  created_at: string
  updated_at: string
}

export interface AlumniProfile {
  id: number
  user_id: number
  university_name: string
  course_completed: string
  graduation_year: number
  certificate_url: string | null
  certificate_uploaded_at: string | null
  created_at: string
  updated_at: string
}

export interface ProfessionalProfile {
  id: number
  user_id: number
  job_title: string
  company: string
  industry_sector: string
  years_of_experience: number
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

export interface MentorshipPreference {
  id: number
  user_id: number
  is_mentor: boolean
  is_mentee: boolean
  areas_of_interest: string[]
  availability_hours_per_week: number
  preferred_format: string
  created_at: string
  updated_at: string
}

export interface FullProfile {
  id: number
  email: string
  full_name: string
  role: string
  verification_status: 'verified' | 'pending' | 'unverified' | 'self_declared'
  is_verified: boolean
  student_profile: StudentProfile | null
  alumni_profile: AlumniProfile | null
  professional_profile: ProfessionalProfile | null
  mentorship_preferences: MentorshipPreference | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function hasRoleProfile(fp: FullProfile): boolean {
  switch (fp.role?.toUpperCase()) {
    case 'STUDENT': return !!fp.student_profile
    case 'ALUMNI': return !!fp.alumni_profile
    case 'PROFESSIONAL': return !!fp.professional_profile
    default: return true // ADMIN / MENTOR — skip role profile step
  }
}

export function getDashboardForRole(role: string): string {
  switch (role?.toUpperCase()) {
    case 'STUDENT': return '/dashboard'
    case 'ADMIN': return '/admin'
    default: return '/alumni-dashboard'
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useFullProfile() {
  return useQuery({
    queryKey: ['full-profile'],
    queryFn: () => api.get<FullProfile>('/profile/me'),
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      api.get<{ message: string }>('/auth/verify-email', { token }),
  })
}

export function useCreateStudentProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      university_name: string
      course_title: string
      year_of_study: number
      expected_graduation: number
    }) => api.post<StudentProfile>('/profile/student', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['full-profile'] }),
  })
}

export function useCreateAlumniProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      university_name,
      course_completed,
      graduation_year,
      certificate,
    }: {
      university_name: string
      course_completed: string
      graduation_year: number
      certificate?: File
    }) => {
      const fd = new FormData()
      fd.append('university_name', university_name)
      fd.append('course_completed', course_completed)
      fd.append('graduation_year', String(graduation_year))
      if (certificate) fd.append('certificate', certificate)
      return api.postForm<AlumniProfile>('/profile/alumni', fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['full-profile'] }),
  })
}

export function useCreateProfessionalProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      job_title: string
      company: string
      industry_sector: string
      years_of_experience: number
      linkedin_url?: string
    }) => api.post<ProfessionalProfile>('/profile/professional', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['full-profile'] }),
  })
}

export function useSetMentorshipPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      is_mentor: boolean
      is_mentee: boolean
      areas_of_interest: string[]
      availability_hours_per_week: number
      preferred_format: string
    }) => api.post<MentorshipPreference>('/profile/mentorship/preferences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['full-profile'] }),
  })
}
