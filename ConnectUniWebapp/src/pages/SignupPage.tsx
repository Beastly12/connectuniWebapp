import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Users, Briefcase, GraduationCap as GradIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Step = 'credentials' | 'role' | 'profile'
type SignupRole = 'STUDENT' | 'ALUMNI' | 'PROFESSIONAL'

const roles: { value: SignupRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'STUDENT', label: 'Current Student', description: 'Seeking mentorship, jobs, and guidance from alumni', icon: GradIcon },
  { value: 'ALUMNI', label: 'Alumni', description: 'Give back by mentoring current students', icon: Users },
  { value: 'PROFESSIONAL', label: 'Industry Professional', description: 'Industry expert offering career guidance', icon: Briefcase },
]

const steps: { key: Step; label: string }[] = [
  { key: 'credentials', label: 'Account' },
  { key: 'role', label: 'Role' },
  { key: 'profile', label: 'Profile' },
]

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('credentials')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null)
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setStep('role')
  }

  function handleRole() {
    if (!selectedRole) { toast.error('Please select a role'); return }
    setStep('profile')
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { toast.error('Please enter your full name'); return }
    if (!university.trim()) { toast.error('Please enter your university'); return }
    if (!major.trim()) { toast.error('Please enter your major'); return }
    if (!graduationYear) { toast.error('Please enter your graduation year'); return }

    setLoading(true)
    try {
      const error = await signUp({
        email,
        password,
        full_name: fullName.trim(),
        university_name: university.trim(),
        graduation_year: parseInt(graduationYear),
        major: major.trim(),
        role: selectedRole!,
      })
      if (error) {
        toast.error(error.message)
        return
      }

      navigate('/auth/check-email', { state: { email }, replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[460px] flex-col relative overflow-hidden shrink-0">
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
              <GraduationCap className="h-4.5 w-4.5 text-white" style={{ height: '1.1rem', width: '1.1rem' }} />
            </div>
            <span className="text-sm font-bold text-white/90 tracking-tight">ConnectUni</span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 mb-4">
                <Sparkles className="h-3 w-3 text-white/80" />
                <span className="text-xs text-white/80 font-medium">Join thousands of students</span>
              </div>
              <h2 className="text-[2rem] font-bold text-white leading-tight tracking-tight">
                Your future<br />network starts<br />
                <span className="text-white/65">here.</span>
              </h2>
              <p className="mt-4 text-sm text-white/55 leading-relaxed max-w-[280px]">
                Create your free account and unlock mentorship, career insights, and community.
              </p>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: '2,400+', label: 'Students' },
                { num: '860+', label: 'Alumni mentors' },
                { num: '94%', label: 'Success rate' },
                { num: '48h', label: 'Avg. match time' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/10 border border-white/15 px-4 py-3">
                  <p className="text-lg font-bold text-white">{stat.num}</p>
                  <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} ConnectUni. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 relative">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from)), transparent 70%)' }}
        />

        {/* Mobile brand */}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <GraduationCap className="h-5.5 w-5.5 text-white" style={{ height: '1.3rem', width: '1.3rem' }} />
          </div>
          <span className="text-base font-bold gradient-text">ConnectUni</span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                      i < stepIndex
                        ? 'gradient-primary text-white shadow-glow-sm'
                        : i === stepIndex
                        ? 'gradient-primary text-white shadow-glow ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground/60'
                    )}
                  >
                    {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold tracking-wide uppercase',
                    i === stepIndex ? 'text-primary' : 'text-muted-foreground/50'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'h-px w-12 mb-5 mx-1 transition-all duration-300',
                    i < stepIndex ? 'gradient-primary h-0.5' : 'bg-border'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step: Credentials */}
          {step === 'credentials' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Start with your email and password</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="h-10 bg-muted/50 border-border/60 focus:border-primary/60 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step: Role */}
          {step === 'role' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Choose your role</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">This shapes your ConnectUni experience</p>
              </div>

              <div className="space-y-2.5">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer',
                      selectedRole === r.value
                        ? 'border-primary/40 bg-accent shadow-glow-sm'
                        : 'border-border/50 hover:border-border hover:bg-muted/30 bg-muted/20'
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                        selectedRole === r.value
                          ? 'gradient-primary text-white shadow-glow-sm'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <r.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{r.label}</p>
                          {selectedRole === r.value && (
                            <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{r.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5">
                <Button variant="outline" onClick={() => setStep('credentials')} className="flex-1 h-10 border-border/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleRole}
                  disabled={!selectedRole}
                  className="flex-1 h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {step === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Tell the community a little about yourself</p>
              </div>

              <form onSubmit={handleProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground/80">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="university" className="text-sm font-medium text-foreground/80">University</Label>
                  <Input
                    id="university"
                    placeholder="University of Example"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="major" className="text-sm font-medium text-foreground/80">Major</Label>
                    <Input
                      id="major"
                      placeholder="Computer Science"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required
                      className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gradYear" className="text-sm font-medium text-foreground/80">Grad year</Label>
                    <Input
                      id="gradYear"
                      placeholder={selectedRole === 'ALUMNI' ? '2023' : selectedRole === 'PROFESSIONAL' ? '2018' : '2027'}
                      type="number"
                      min="1950"
                      max="2040"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                      className="h-10 bg-muted/50 border-border/60 focus:border-primary/60"
                    />
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Button variant="outline" type="button" onClick={() => setStep('role')} className="flex-1 h-10 border-border/50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating…
                      </span>
                    ) : (
                      <>
                        Complete setup
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
