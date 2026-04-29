import '@/styles/auth.css'
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api, getErrorMessage } from '@/lib/api'

type Status = 'loading' | 'success' | 'error'

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  )
}

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid or missing verification link.')
      return
    }
    api
      .get<{ message: string }>('/auth/verify-email', { token })
      .then((data) => {
        setStatus('success')
        setMessage(data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(getErrorMessage(err, 'Verification failed. The link may have expired.'))
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          {status === 'loading' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <Loader2 size={48} className="animate-spin" style={{ color: '#EF4B24' }} />
              </div>
              <span className="au-eyebrow">Please wait</span>
              <h1 className="au-display">Verifying your<br />email…</h1>
              <p className="au-sub">Just a moment while we confirm your address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="au-big-icon">
                <CheckCircle2 size={44} />
              </div>
              <span className="au-eyebrow">Verified</span>
              <h1 className="au-display">You're in.</h1>
              <p className="au-sub">{message || 'Your account is now active. Sign in to get started.'}</p>

              <div className="au-success-panel">
                <div className="au-sp-check">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="au-sp-title">Email confirmed</div>
                  <div className="au-sp-desc">Your account is ready to use.</div>
                </div>
              </div>

              <div className="au-cta-row">
                <Link to="/login" className="au-btn" style={{ textDecoration: 'none' }}>
                  Continue to sign in
                  <span className="au-arrow-circle"><ArrowUpRight /></span>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="au-big-icon au-orange">
                <XCircle size={44} />
              </div>
              <span className="au-eyebrow">Oops</span>
              <h1 className="au-display">Verification<br />failed.</h1>
              <p className="au-sub">{message}</p>

              <div className="au-cta-row">
                <Link to="/login" className="au-btn" style={{ textDecoration: 'none', flex: 1 }}>
                  Go to sign in
                  <span className="au-arrow-circle"><ArrowUpRight /></span>
                </Link>
              </div>
              <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: '#6B6B6B' }}>
                <Link to="/signup" style={{ color: '#1A1A1A', fontWeight: 600, textDecoration: 'none' }}>Create a new account</Link>
              </p>
            </>
          )}
        </div>

        <div className="au-form-footer">
          <span>© {new Date().getFullYear()} ConnectUni</span>
        </div>
      </div>

      {/* ── Photo column ── */}
      <div className="au-col-photo alt-1" />
    </div>
  )
}
