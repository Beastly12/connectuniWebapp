import '@/styles/auth.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

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

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const error = await resetPassword(email)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
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
          <Link to="/login" className="au-back-link" style={{ fontSize: 13, color: '#6B6B6B', textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </div>

        <div className="au-form-body">
          {sent ? (
            <>
              <div className="au-big-icon" style={{ background: '#D4E8B8' }}>
                <Mail size={44} />
              </div>
              <span className="au-eyebrow">Email sent</span>
              <h1 className="au-display">Check your<br />inbox.</h1>
              <p className="au-sub">
                We sent a reset link to <strong style={{ color: '#1A1A1A' }}>{email}</strong>. Links expire in 1 hour.
              </p>
              <p className="au-hint" style={{ marginTop: 12 }}>Check spam if you don't see it within 5 minutes.</p>
              <div className="au-cta-row">
                <button type="button" className="au-btn" onClick={() => setSent(false)}>
                  Try a different email
                  <span className="au-arrow-circle"><ArrowUpRight /></span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="au-big-icon au-orange">
                <Lock size={44} />
              </div>
              <span className="au-eyebrow">Account recovery</span>
              <h1 className="au-display au-display-lg">Forgot your<br />password?</h1>
              <p className="au-sub">Happens to the best of us. Enter the email on your account and we'll send a reset link.</p>

              <form onSubmit={handleSubmit}>
                <div className="au-field">
                  <label htmlFor="fp-email">Email</label>
                  <div className="au-input-wrap">
                    <span className="au-icon-left"><Mail size={16} /></span>
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="you@university.ac.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="au-cta-row">
                  <button type="submit" className="au-btn" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                    <span className="au-arrow-circle"><ArrowUpRight /></span>
                  </button>
                </div>
                <p className="au-hint" style={{ marginTop: 14 }}>Links expire in 1 hour. Check spam if you don't see one within 5 minutes.</p>
              </form>
            </>
          )}
        </div>

        <div className="au-form-footer">
          <span>Remembered it? <Link to="/login">Sign in</Link></span>
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column ── */}
      <div className="au-col-photo">
        <div className="au-quote-float">
          <div className="au-stars">
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>
          <blockquote>"Lost my password the night before a big intro call. Recovery took ninety seconds."</blockquote>
          <div className="au-qfoot">
            <div className="au-av av-4" />
            <div>
              <div className="au-qfoot-name">Jordan Pierce</div>
              <div className="au-qfoot-role">Final year · Business · LSE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
