import '@/styles/auth.css'
import { useLocation, Link } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import { api, getErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

export default function CheckEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''
  const isAcUk = email.toLowerCase().endsWith('.ac.uk')
  const [resending, setResending] = useState(false)

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      await api.postPublic('/auth/resend-verification', { email })
      toast.success('Verification email resent!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not resend the verification email'))
    } finally {
      setResending(false)
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
        </div>

        <div className="au-form-body">
          <div className="au-big-icon">
            <Mail size={44} />
          </div>

          <span className="au-eyebrow">One more step</span>
          <h1 className="au-display">
            {email ? `Check your email${email ? ',' : '.'}`
              : 'Check your email.'}
          </h1>
          {email && (
            <p className="au-sub" style={{ wordBreak: 'break-word' }}>
              We sent a verification link to <strong style={{ color: '#1A1A1A' }}>{email}</strong>. Click the link to activate your account.
            </p>
          )}
          {!email && (
            <p className="au-sub">We sent a verification link to your email. Click the link to activate your account.</p>
          )}

          <div className="au-expiry-pill">
            <span className="au-expiry-dot" />
            Link expires in 24 hours
          </div>

          {isAcUk && (
            <div className="au-ac-banner">
              <div className="au-ac-badge">
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>.ac.uk address detected</strong> — verifying this will confirm your student status automatically.
              </div>
            </div>
          )}

          <div className="au-cta-row" style={{ marginTop: 32 }}>
            {email && (
              <button
                type="button"
                className="au-btn au-btn-ghost"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            )}
            <Link
              to="/login"
              className="au-btn"
              style={{ textDecoration: 'none', flex: 1 }}
            >
              Go to sign in
              <span className="au-arrow-circle"><ArrowUpRight /></span>
            </Link>
          </div>

          <p className="au-hint" style={{ marginTop: 14 }}>
            Check spam if you don't see it. Make sure you signed up with this exact address.
          </p>
        </div>

        <div className="au-form-footer">
          <span>Wrong email? <Link to="/signup">Start over</Link></span>
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column (dark blue) ── */}
      <div className="au-col-photo alt-2" />
    </div>
  )
}
