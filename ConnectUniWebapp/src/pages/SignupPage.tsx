import '@/styles/auth.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, Briefcase, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'

type Step = 'credentials' | 'role' | 'profile'
type SignupRole = 'STUDENT' | 'ALUMNI' | 'PROFESSIONAL'

const ROLES: { value: SignupRole; label: string; description: string; Icon: React.ElementType }[] = [
  { value: 'STUDENT', label: 'Current Student', description: 'Seeking mentorship, jobs, and guidance from alumni', Icon: GraduationCap },
  { value: 'ALUMNI', label: 'Alumni', description: 'Give back by mentoring current students', Icon: Users },
  { value: 'PROFESSIONAL', label: 'Industry Professional', description: 'Industry expert offering career guidance', Icon: Briefcase },
]

function getStrength(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 4) s++
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  )
}

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

  const strength = getStrength(password)
  const strengthStatus = strength >= 4 ? 'ok' : 'on'

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
      if (error) { toast.error(error.message); return }
      navigate('/auth/check-email', { state: { email }, replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }

  const photoPanel = (
    <div className="au-col-photo alt-1">
      <div className="au-members-float">
        <div className="au-avatar-stack">
          <div className="au-av av-3" />
          <div className="au-av av-2" />
          <div className="au-av av-4" />
        </div>
        <div className="au-members-text">
          2,400+ Students
          <small>Already joined</small>
        </div>
      </div>
      <div className="au-quote-float">
        <div className="au-stars">
          {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
        </div>
        <blockquote>"I went from having no idea how to network to having three coffee chats lined up — all within my first two weeks."</blockquote>
        <div className="au-qfoot">
          <div className="au-av av-3" />
          <div>
            <div className="au-qfoot-name">Tom Bradley</div>
            <div className="au-qfoot-role">Final year · Economics · University of Edinburgh</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="au-screen">
      <div className="au-col-form">
        {/* ── Credentials step ── */}
        {step === 'credentials' && (
          <>
            <div className="au-form-header">
              <Link to="/" className="au-brand">
                <span className="au-logo-mark" />
                ConnectUni
              </Link>
              <div className="au-step-pill">
                <span>01/03</span>
                <div className="au-step-seg">
                  <span className="s on" /><span className="s" /><span className="s" />
                </div>
              </div>
            </div>

            <div className="au-form-body">
              <span className="au-eyebrow">Start here</span>
              <h1 className="au-display">Create your<br />account.</h1>
              <p className="au-sub">Use your university email for automatic institution verification.</p>

              <form onSubmit={handleCredentials}>
                <div className="au-field">
                  <label htmlFor="su-email">University email</label>
                  <div className="au-input-wrap">
                    <span className="au-icon-left"><Mail size={16} /></span>
                    <input
                      id="su-email"
                      type="email"
                      placeholder="you@university.ac.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="au-field">
                  <label htmlFor="su-password">Password</label>
                  <div className="au-input-wrap">
                    <span className="au-icon-left"><Lock size={16} /></span>
                    <input
                      id="su-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="au-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="au-strength">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`seg${i < strength ? ` ${strengthStatus}` : ''}`} />
                      ))}
                    </div>
                  )}
                  {password.length > 0 && (
                    <p className="au-hint">
                      {strength <= 1 && 'Too short'}
                      {strength === 2 && 'Weak — try adding uppercase or numbers'}
                      {strength === 3 && 'Getting there — add a symbol'}
                      {strength === 4 && 'Strong password'}
                      {strength >= 5 && 'Very strong'}
                    </p>
                  )}
                </div>

                <div className="au-cta-row">
                  <button type="submit" className="au-btn">
                    Continue
                    <span className="au-arrow-circle"><ArrowUpRight /></span>
                  </button>
                </div>
              </form>

              <p style={{ marginTop: 24, fontSize: 13, color: '#6B6B6B', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1A1A1A', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </div>

            <div className="au-form-footer">
              <span>© {new Date().getFullYear()} ConnectUni</span>
            </div>
          </>
        )}

        {/* ── Role step ── */}
        {step === 'role' && (
          <>
            <div className="au-form-header">
              <Link to="/" className="au-brand">
                <span className="au-logo-mark" />
                ConnectUni
              </Link>
              <div className="au-step-pill">
                <span>02/03</span>
                <div className="au-step-seg">
                  <span className="s on" /><span className="s on" /><span className="s" />
                </div>
              </div>
            </div>

            <div className="au-form-body">
              <span className="au-eyebrow">Your role</span>
              <h1 className="au-display">How will you use<br />ConnectUni?</h1>
              <p className="au-sub">This shapes your experience and who you'll connect with.</p>

              <div className="au-role-stack">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`au-role-option${selectedRole === r.value ? ' selected' : ''}`}
                    onClick={() => setSelectedRole(r.value)}
                  >
                    <div className="au-role-ico">
                      <r.Icon size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="au-role-title">{r.label}</div>
                      <div className="au-role-desc">{r.description}</div>
                    </div>
                    <div className="au-role-chk">
                      {selectedRole === r.value && <Check size={14} />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="au-cta-row">
                <button type="button" className="au-btn au-btn-ghost" onClick={() => setStep('credentials')}>
                  ← Back
                </button>
                <button type="button" className="au-btn" style={{ flex: 1 }} disabled={!selectedRole} onClick={handleRole}>
                  Continue
                  <span className="au-arrow-circle"><ArrowUpRight /></span>
                </button>
              </div>
            </div>

            <div className="au-form-footer">
              <span>Admins are invited by institution</span>
              <span>© {new Date().getFullYear()} ConnectUni</span>
            </div>
          </>
        )}

        {/* ── Profile step ── */}
        {step === 'profile' && (
          <>
            <div className="au-form-header">
              <Link to="/" className="au-brand">
                <span className="au-logo-mark" />
                ConnectUni
              </Link>
              <div className="au-step-pill">
                <span>03/03</span>
                <div className="au-step-seg">
                  <span className="s on" /><span className="s on" /><span className="s on" />
                </div>
              </div>
            </div>

            <div className="au-form-body">
              <span className="au-eyebrow">Profile</span>
              <h1 className="au-display">Tell us about<br />yourself.</h1>
              <p className="au-sub">This helps your matches feel relevant from day one.</p>

              <form onSubmit={handleProfile}>
                <div className="au-field">
                  <label htmlFor="su-name">Full name</label>
                  <div className="au-input-wrap">
                    <input
                      id="su-name"
                      placeholder="Jane Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="au-field">
                  <label htmlFor="su-uni">University</label>
                  <div className="au-input-wrap">
                    <input
                      id="su-uni"
                      placeholder="University of Example"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="au-field-row">
                  <div className="au-field">
                    <label htmlFor="su-major">Major / Course</label>
                    <div className="au-input-wrap">
                      <input
                        id="su-major"
                        placeholder="Computer Science"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="au-field">
                    <label htmlFor="su-gradyr">
                      {selectedRole === 'ALUMNI' ? 'Graduated' : selectedRole === 'PROFESSIONAL' ? 'Grad year' : 'Expected grad'}
                    </label>
                    <div className="au-input-wrap">
                      <input
                        id="su-gradyr"
                        type="number"
                        placeholder={selectedRole === 'ALUMNI' ? '2022' : selectedRole === 'PROFESSIONAL' ? '2018' : '2027'}
                        min={1950}
                        max={2040}
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="au-cta-row">
                  <button type="button" className="au-btn au-btn-ghost" onClick={() => setStep('role')}>
                    ← Back
                  </button>
                  <button type="submit" className="au-btn" style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Creating…' : 'Create account'}
                    <span className="au-arrow-circle"><ArrowUpRight /></span>
                  </button>
                </div>
              </form>
            </div>

            <div className="au-form-footer">
              <span>
                By creating an account you agree to our{' '}
                <a href="#" style={{ color: '#EF4B24' }}>Terms</a>
              </span>
              <span>© {new Date().getFullYear()} ConnectUni</span>
            </div>
          </>
        )}
      </div>

      {photoPanel}
    </div>
  )
}
