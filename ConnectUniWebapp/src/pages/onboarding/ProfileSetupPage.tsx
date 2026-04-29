import '@/styles/auth.css'
import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Upload, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useFullProfile,
  useCreateStudentProfile,
  useCreateAlumniProfile,
  useCreateProfessionalProfile,
} from '@/hooks/useOnboarding'
import { getErrorMessage } from '@/lib/api'

const INDUSTRY_SECTORS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Engineering',
  'Marketing & Communications', 'Legal', 'Consulting', 'Media & Entertainment',
  'Retail & E-commerce', 'Government & Public Sector', 'Nonprofit',
  'Research & Academia', 'Other',
]

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

// ─── Student Form ──────────────────────────────────────────────────────────────

function StudentForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateStudentProfile()
  const currentYear = new Date().getFullYear()
  const [universityName, setUniversityName] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null)
  const [expectedGraduation, setExpectedGraduation] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!yearOfStudy) { toast.error('Please select your year of study'); return }
    mutation.mutate(
      {
        university_name: universityName.trim(),
        course_title: courseTitle.trim(),
        year_of_study: yearOfStudy,
        expected_graduation: parseInt(expectedGraduation),
      },
      {
        onSuccess: () => { toast.success('Profile saved!'); onSuccess() },
        onError: (err) => toast.error(getErrorMessage(err, 'Failed to save profile')),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="au-field">
        <label>University name</label>
        <div className="au-input-wrap">
          <input
            placeholder="University of Example"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="au-field">
        <label>Course title</label>
        <div className="au-input-wrap">
          <input
            placeholder="BSc Computer Science"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="au-field">
        <label>Year of study</label>
        <div className="au-year-pills">
          {[1, 2, 3, 4, 5].map((y) => (
            <button
              key={y}
              type="button"
              className={`au-year-pill${yearOfStudy === y ? ' active' : ''}`}
              onClick={() => setYearOfStudy(y)}
            >
              Year {y}
            </button>
          ))}
        </div>
      </div>

      <div className="au-field">
        <label>Expected graduation year</label>
        <div className="au-input-wrap">
          <input
            type="number"
            placeholder={String(currentYear + 2)}
            min={currentYear}
            max={2040}
            value={expectedGraduation}
            onChange={(e) => setExpectedGraduation(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="au-cta-row">
        <button
          type="submit"
          className="au-btn"
          disabled={mutation.isPending || !universityName || !courseTitle || !yearOfStudy || !expectedGraduation}
        >
          {mutation.isPending ? 'Saving…' : 'Continue'}
          <span className="au-arrow-circle"><ArrowUpRight /></span>
        </button>
      </div>
    </form>
  )
}

// ─── Alumni Form ──────────────────────────────────────────────────────────────

function AlumniForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateAlumniProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [universityName, setUniversityName] = useState('')
  const [courseCompleted, setCourseCompleted] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [certificate, setCertificate] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or PDF file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setCertificate(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        university_name: universityName.trim(),
        course_completed: courseCompleted.trim(),
        graduation_year: parseInt(graduationYear),
        certificate: certificate ?? undefined,
      },
      {
        onSuccess: () => {
          if (certificate) {
            toast.success("Profile saved! Your certificate has been submitted for review.")
          } else {
            toast.success('Profile saved!')
          }
          onSuccess()
        },
        onError: (err) => toast.error(getErrorMessage(err, 'Failed to save profile')),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="au-field">
        <label>University attended</label>
        <div className="au-input-wrap">
          <input
            placeholder="University of Example"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="au-field-row">
        <div className="au-field">
          <label>Course completed</label>
          <div className="au-input-wrap">
            <input
              placeholder="BSc Computer Science"
              value={courseCompleted}
              onChange={(e) => setCourseCompleted(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="au-field">
          <label>Graduation year</label>
          <div className="au-input-wrap">
            <input
              type="number"
              placeholder="2023"
              max={new Date().getFullYear() - 1}
              min={1950}
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="au-field">
        <label>
          Graduation certificate{' '}
          <span style={{ textTransform: 'none', fontWeight: 500, color: '#9A9A9A' }}>(optional)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {certificate ? (
          <div className="au-upload-filled">
            <CheckCircle2 size={16} color="#8fb65a" />
            <span className="au-uf-name">{certificate.name}</span>
            <button
              type="button"
              onClick={() => {
                setCertificate(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button type="button" className="au-upload-zone" onClick={() => fileInputRef.current?.click()}>
            <div className="au-upload-cloud">
              <Upload size={22} />
            </div>
            <div className="au-uz-title">Upload your certificate</div>
            <div className="au-uz-desc">Speed up alumni verification</div>
            <div className="au-uz-formats">
              {['JPG', 'PNG', 'WEBP', 'PDF'].map(f => (
                <span key={f} className="au-uz-pill">{f}</span>
              ))}
              <span className="au-uz-pill">max 10 MB</span>
            </div>
          </button>
        )}
        {certificate && (
          <p className="au-hint" style={{ color: '#8fb65a' }}>
            Certificate submitted for review — you'll receive an email once verified.
          </p>
        )}
      </div>

      <div className="au-cta-row">
        <button
          type="submit"
          className="au-btn"
          disabled={mutation.isPending || !universityName || !courseCompleted || !graduationYear}
        >
          {mutation.isPending ? 'Saving…' : 'Continue'}
          <span className="au-arrow-circle"><ArrowUpRight /></span>
        </button>
      </div>
    </form>
  )
}

// ─── Professional Form ────────────────────────────────────────────────────────

const EXP_RANGES = [
  { label: '< 1', value: 0 },
  { label: '1–3', value: 2 },
  { label: '4–7', value: 5 },
  { label: '8–12', value: 10 },
  { label: '13+', value: 15 },
]

function ProfessionalForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateProfessionalProfile()
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industrySector, setIndustrySector] = useState('')
  const [yearsValue, setYearsValue] = useState<number | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState('')

  function isValidLinkedin(url: string): boolean {
    if (!url) return true
    try { return new URL(url).hostname.includes('linkedin.com') } catch { return false }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (yearsValue === null) { toast.error('Please select your years of experience'); return }
    if (linkedinUrl && !isValidLinkedin(linkedinUrl)) {
      toast.error('Please enter a valid LinkedIn URL')
      return
    }
    mutation.mutate(
      {
        job_title: jobTitle.trim(),
        company: company.trim(),
        industry_sector: industrySector,
        years_of_experience: yearsValue,
        linkedin_url: linkedinUrl.trim() || undefined,
      },
      {
        onSuccess: () => { toast.success('Profile saved!'); onSuccess() },
        onError: (err) => toast.error(getErrorMessage(err, 'Failed to save profile')),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="au-field-row">
        <div className="au-field">
          <label>Job title</label>
          <div className="au-input-wrap">
            <input
              placeholder="Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="au-field">
          <label>Company</label>
          <div className="au-input-wrap">
            <input
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="au-field">
        <label>Industry sector</label>
        <div className="au-input-wrap" style={{ paddingRight: 16 }}>
          <select
            value={industrySector}
            onChange={(e) => setIndustrySector(e.target.value)}
            required
          >
            <option value="" disabled>Select sector</option>
            {INDUSTRY_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="au-field">
        <label>Years of experience</label>
        <div className="au-year-pills">
          {EXP_RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              className={`au-year-pill${yearsValue === r.value ? ' active' : ''}`}
              onClick={() => setYearsValue(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="au-field">
        <label>
          LinkedIn{' '}
          <span style={{ textTransform: 'none', fontWeight: 500, color: '#9A9A9A' }}>(optional)</span>
        </label>
        <div className="au-input-wrap">
          <input
            type="url"
            placeholder="linkedin.com/in/…"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="au-cta-row">
        <button
          type="submit"
          className="au-btn"
          disabled={mutation.isPending || !jobTitle || !company || !industrySector || yearsValue === null}
        >
          {mutation.isPending ? 'Saving…' : 'Continue'}
          <span className="au-arrow-circle"><ArrowUpRight /></span>
        </button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type RoleTab = 'STUDENT' | 'ALUMNI' | 'PROFESSIONAL'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, isError } = useFullProfile()
  const [activeTab, setActiveTab] = useState<RoleTab | null>(null)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #EF4B24', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <p style={{ fontSize: 14, color: '#6B6B6B' }}>
          Something went wrong. Please{' '}
          <a href="/login" style={{ color: '#EF4B24', textDecoration: 'none', fontWeight: 600 }}>sign in again</a>.
        </p>
      </div>
    )
  }

  const role = (profile.role?.toUpperCase() ?? 'STUDENT') as RoleTab
  const resolvedTab: RoleTab = activeTab ?? (
    role === 'ALUMNI' ? 'ALUMNI' : role === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'STUDENT'
  )

  return (
    <div className="au-screen">
      {/* ── Form column ── */}
      <div className="au-col-form">
        <div className="au-form-header">
          <Link to="/" className="au-brand">
            <span className="au-logo-mark" />
            ConnectUni
          </Link>
          <div className="au-progress-pill">
            <div className="au-pp-seg">
              <span className="s on" /><span className="s" />
            </div>
            Step 1 of 2
          </div>
        </div>

        <div className="au-form-body" style={{ maxWidth: 560 }}>
          <span className="au-eyebrow">Role profile</span>
          <h1 className="au-display">Set up your<br />profile.</h1>
          <p className="au-sub">Tell the community about your background so we can match you well.</p>

          <div style={{ marginTop: 28 }}>
            <div className="au-variant-tabs">
              {(['STUDENT', 'ALUMNI', 'PROFESSIONAL'] as RoleTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`au-variant-tab${resolvedTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'STUDENT' ? 'Student' : t === 'ALUMNI' ? 'Alumni' : 'Professional'}
                </button>
              ))}
            </div>

            {resolvedTab === 'STUDENT' && (
              <StudentForm onSuccess={() => navigate('/onboarding/mentorship')} />
            )}
            {resolvedTab === 'ALUMNI' && (
              <AlumniForm onSuccess={() => navigate('/onboarding/mentorship')} />
            )}
            {resolvedTab === 'PROFESSIONAL' && (
              <ProfessionalForm onSuccess={() => navigate('/onboarding/mentorship')} />
            )}
          </div>
        </div>

        <div className="au-form-footer">
          <span>You can update this anytime from your profile</span>
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column ── */}
      <div className="au-col-photo alt-2">
        <div className="au-quote-float">
          <div className="au-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
            ))}
          </div>
          <blockquote>"Setting up my profile took five minutes — and I had my first mentor match the same afternoon."</blockquote>
          <div className="au-qfoot">
            <div className="au-av av-2" />
            <div>
              <div className="au-qfoot-name">Amara Osei</div>
              <div className="au-qfoot-role">Final year · Law · University of Manchester</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
