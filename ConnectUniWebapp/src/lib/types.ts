export type UserRole = 'student' | 'alumni' | 'professional' | 'admin'

export type MentorAvailability = 'available' | 'busy' | 'unavailable'

export type MentorshipStatus = 'pending' | 'active' | 'completed' | 'declined'

export type MentorshipFrequency = 'weekly' | 'bi-weekly' | 'monthly'

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote'

export type ApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  bio?: string
  university?: string
  graduation_year?: number
  major?: string
  industry?: string
  company?: string
  job_title?: string
  linkedin_url?: string
  is_mentor: boolean
  mentor_expertise?: string[]
  mentor_availability?: MentorAvailability
  availability?: MentorAvailability
  is_online?: boolean
  is_verified?: boolean
  created_at: string
  updated_at: string
}

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
}

export interface Mentorship {
  id: string
  mentor_id: string
  mentee_id: string
  status: MentorshipStatus
  goals?: string[]
  frequency?: MentorshipFrequency
  message?: string
  intro_message?: string
  created_at: string
  updated_at: string
  mentor?: Profile
  mentee?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message?: string
  last_message_at?: string
  created_at: string
  other_participant?: Profile
  unread_count?: number
}

export interface Post {
  id: string
  author_id: string
  content: string
  category: string
  likes_count: number
  comments_count: number
  created_at: string
  author?: Profile
  user_has_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description: string
  event_date: string
  location?: string
  is_virtual: boolean
  meeting_link?: string
  max_attendees?: number
  rsvp_count?: number
  created_at: string
  organizer?: Pick<Profile, 'id' | 'user_id' | 'full_name' | 'avatar_url'>
}

export interface Job {
  id: string
  posted_by: string
  title: string
  company: string
  location?: string
  job_type: JobType
  description: string
  salary_range?: string
  apply_url?: string
  deadline?: string
  is_active?: boolean
  created_at: string
  poster?: Pick<Profile, 'id' | 'user_id' | 'full_name' | 'avatar_url' | 'company'>
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  status: ApplicationStatus
  cover_letter?: string
  applied_at: string
  job?: Job
}

export interface Resource {
  id: string
  uploaded_by: string
  title: string
  description?: string
  url: string
  category: string
  file_type?: string
  created_at: string
  uploader?: Pick<Profile, 'id' | 'user_id' | 'full_name' | 'avatar_url'>
}

export interface Notification {
  id: number
  type: string
  sender_id: number
  sender_name: string
  sender_avatar: string | null
  reference_id: number | null
  body: string
  is_read: boolean
  created_at: string
}
