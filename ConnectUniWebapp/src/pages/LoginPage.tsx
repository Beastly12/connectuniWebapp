import '@/styles/auth.css'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { getFullProfileQueryKey, hasRoleProfile, getDashboardForRole } from '@/hooks/useOnboarding'
import type { FullProfile } from '@/hooks/useOnboarding'

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

export default function LoginPage() {
  const { signIn } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const error = await signIn(email, password)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Welcome back!')
    try {
      const fp = await api.get<FullProfile>('/profile/me')
      qc.setQueryData(getFullProfileQueryKey(), fp)
      if (!hasRoleProfile(fp)) {
        navigate('/onboarding/profile', { replace: true })
      } else if (!fp.mentorship_preferences) {
        navigate('/onboarding/mentorship', { replace: true })
      } else {
        navigate(from ?? getDashboardForRole(fp.role), { replace: true })
      }
    } catch {
      navigate(from ?? '/dashboard', { replace: true })
    }
  }

  return (
    <div className="au-screen">
      {/* ── Form column ── */}
      <div className="au-col-form">
        <div className="au-form-header">
          <Link to="/" className="au-brand">
            <span className="au-logo-mark" />
            ConnectUni
          </Link>
          <div className="au-step-pill">
            New here?&nbsp;
            <Link to="/signup" style={{ color: '#EF4B24', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
          </div>
        </div>

        <div className="au-form-body">
          <span className="au-eyebrow">Welcome back</span>
          <h1 className="au-display">Good to see you<br />again.</h1>
          <p className="au-sub">Sign in to your ConnectUni account to continue your mentorship conversations.</p>

          <form onSubmit={handleSubmit}>
            <div className="au-field">
              <label htmlFor="login-email">Email</label>
              <div className="au-input-wrap">
                <span className="au-icon-left"><Mail size={16} /></span>
                <input
                  id="login-email"
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
              <label htmlFor="login-password">Password</label>
              <div className="au-input-wrap">
                <span className="au-icon-left"><Lock size={16} /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="au-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="au-forgot-row">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </div>

            <div className="au-cta-row">
              <button type="submit" className="au-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
                <span className="au-arrow-circle"><ArrowUpRight /></span>
              </button>
            </div>
          </form>

          <div className="au-divider">or continue with</div>
          <div className="au-sso-row">
            <button type="button" className="au-sso-btn" onClick={() => toast.info('SSO coming soon')}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button type="button" className="au-sso-btn" onClick={() => toast.info('SSO coming soon')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Apple
            </button>
            <button type="button" className="au-sso-btn" onClick={() => toast.info('SSO coming soon')}>
              <svg viewBox="0 0 23 23" width="16" height="16">
                <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                <rect x="13" y="0" width="10" height="10" fill="#7FBA00" />
                <rect x="0" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        <div className="au-form-footer">
          <span>Don't have an account? <Link to="/signup">Sign up free</Link></span>
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column ── */}
      <div className="au-col-photo">
        <div className="au-members-float">
          <div className="au-avatar-stack">
            <div className="au-av" />
            <div className="au-av av-2" />
            <div className="au-av av-3" />
          </div>
          <div className="au-members-text">
            12k+ Members
            <small>Active this week</small>
          </div>
        </div>
        <div className="au-quote-float">
          <div className="au-stars">
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>
          <blockquote>"ConnectUni helped me land my dream grad role — my mentor had been through the exact same process at the same company."</blockquote>
          <div className="au-qfoot">
            <div className="au-av" />
            <div>
              <div className="au-qfoot-name">Priya Raghavan</div>
              <div className="au-qfoot-role">Software Engineer · Atlassian · UCL alumni</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
