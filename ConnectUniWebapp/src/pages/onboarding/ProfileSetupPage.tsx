import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, Upload, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { VerificationBadge } from '@/components/ui/VerificationBadge'
import {
  useFullProfile,
  useCreateStudentProfile,
  useCreateAlumniProfile,
  useCreateProfessionalProfile,
} from '@/hooks/useOnboarding'

const INDUSTRY_SECTORS = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Engineering',
  'Marketing & Communications',
  'Legal',
  'Consulting',
  'Media & Entertainment',
  'Retail & E-commerce',
  'Government & Public Sector',
  'Nonprofit',
  'Research & Academia',
  'Other',
]

// ─── Student Form ─────────────────────────────────────────────────────────────

function StudentForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateStudentProfile()
  const currentYear = new Date().getFullYear()
  const [universityName, setUniversityName] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('')
  const [expectedGraduation, setExpectedGraduation] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        university_name: universityName.trim(),
        course_title: courseTitle.trim(),
        year_of_study: parseInt(yearOfStudy),
        expected_graduation: parseInt(expectedGraduation),
      },
      {
        onSuccess: () => { toast.success('Profile saved!'); onSuccess() },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save profile'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">University name</Label>
        <Input
          placeholder="University of Example"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Course title</Label>
        <Input
          placeholder="BSc Computer Science"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">Year of study</Label>
          <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
            <SelectTrigger className="h-10 bg-muted/50 border-border/60">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((y) => (
                <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">Expected graduation</Label>
          <Input
            type="number"
            placeholder={String(currentYear + 2)}
            min={currentYear}
            max={2040}
            value={expectedGraduation}
            onChange={(e) => setExpectedGraduation(e.target.value)}
            required
            className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || !universityName || !courseTitle || !yearOfStudy || !expectedGraduation}
        className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving…
          </span>
        ) : (
          <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
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
            toast.success("Profile saved! Your certificate has been submitted for review. You'll receive an email once it's been verified.")
          } else {
            toast.success('Profile saved!')
          }
          onSuccess()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save profile'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">University attended</Label>
        <Input
          placeholder="University of Example"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Course completed</Label>
        <Input
          placeholder="BSc Computer Science"
          value={courseCompleted}
          onChange={(e) => setCourseCompleted(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Graduation year</Label>
        <Input
          type="number"
          placeholder="2023"
          max={new Date().getFullYear() - 1}
          min={1950}
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>

      {/* Certificate upload */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">
          Graduation certificate{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {certificate ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-accent/50 px-3 py-2.5">
            <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 text-xs text-foreground truncate">{certificate.name}</span>
            <button
              type="button"
              onClick={() => {
                setCertificate(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3 text-muted-foreground hover:border-primary/40 hover:bg-accent/30 transition-all"
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="text-xs">Upload certificate — JPG, PNG, PDF (max 10 MB)</span>
          </button>
        )}
        {certificate && (
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-snug">
            Your certificate will be submitted for review. You'll receive an email once verified.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || !universityName || !courseCompleted || !graduationYear}
        className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving…
          </span>
        ) : (
          <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </form>
  )
}

// ─── Professional Form ────────────────────────────────────────────────────────

function ProfessionalForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateProfessionalProfile()
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industrySector, setIndustrySector] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  function isValidLinkedin(url: string): boolean {
    if (!url) return true
    try {
      return new URL(url).hostname.includes('linkedin.com')
    } catch {
      return false
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (linkedinUrl && !isValidLinkedin(linkedinUrl)) {
      toast.error('Please enter a valid LinkedIn URL')
      return
    }
    mutation.mutate(
      {
        job_title: jobTitle.trim(),
        company: company.trim(),
        industry_sector: industrySector,
        years_of_experience: parseInt(yearsOfExperience),
        linkedin_url: linkedinUrl.trim() || undefined,
      },
      {
        onSuccess: () => { toast.success('Profile saved!'); onSuccess() },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save profile'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Job title</Label>
        <Input
          placeholder="Software Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Company / Organisation</Label>
        <Input
          placeholder="Acme Corp"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground/80">Industry sector</Label>
        <Select value={industrySector} onValueChange={setIndustrySector}>
          <SelectTrigger className="h-10 bg-muted/50 border-border/60">
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">Years of experience</Label>
          <Input
            type="number"
            placeholder="5"
            min={0}
            max={60}
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            required
            className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground/80">
            LinkedIn{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            type="url"
            placeholder="linkedin.com/in/…"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || !jobTitle || !company || !industrySector || !yearsOfExperience}
        className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving…
          </span>
        ) : (
          <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const roleDescriptions: Record<string, string> = {
  STUDENT: 'Tell us about your studies so we can match you with the right mentors.',
  ALUMNI: 'Share your educational background and optionally upload your graduation certificate.',
  PROFESSIONAL: 'Share your professional background to help students understand your expertise.',
  MENTOR: 'Tell us a bit more about yourself.',
}

const roleSubtitles: Record<string, string> = {
  STUDENT: 'your student profile',
  ALUMNI: 'your alumni profile',
  PROFESSIONAL: 'your professional profile',
  MENTOR: 'your profile',
}

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, isError } = useFullProfile()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please{' '}
          <a href="/login" className="text-primary underline underline-offset-2">sign in again</a>.
        </p>
      </div>
    )
  }

  const role = profile.role?.toUpperCase() ?? 'STUDENT'
  const subtitle = roleSubtitles[role] ?? 'your profile'
  const description = roleDescriptions[role] ?? ''

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[360px] flex-col relative overflow-hidden shrink-0">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex flex-col h-full px-10 py-10 justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/25">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white/90 tracking-tight">ConnectUni</span>
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1">
              <span className="text-xs text-white/80 font-medium">Step 2 of 3 — Profile setup</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
              Set up {subtitle}
            </h2>
            <p className="text-sm text-white/55 leading-relaxed">{description}</p>
          </div>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} ConnectUni</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 relative">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from, var(--primary))), transparent 70%)' }}
        />

        <div className="w-full max-w-[400px] space-y-6">
          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold gradient-text">ConnectUni</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">Set up {subtitle}</h1>
              <VerificationBadge status={profile.verification_status} />
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {role === 'STUDENT' && (
            <StudentForm onSuccess={() => navigate('/onboarding/mentorship')} />
          )}
          {role === 'ALUMNI' && (
            <AlumniForm onSuccess={() => navigate('/onboarding/mentorship')} />
          )}
          {(role === 'PROFESSIONAL' || role === 'MENTOR') && (
            <ProfessionalForm onSuccess={() => navigate('/onboarding/mentorship')} />
          )}
        </div>
      </div>
    </div>
  )
}
