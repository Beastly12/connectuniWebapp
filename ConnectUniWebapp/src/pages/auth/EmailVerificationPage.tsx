import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { GraduationCap, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Status = 'loading' | 'success' | 'error'

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
        setMessage(
          err instanceof Error ? err.message : 'Verification failed. The link may have expired.'
        )
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="pointer-events-none fixed top-0 right-0 h-64 w-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(var(--gradient-from, var(--primary))), transparent 70%)' }}
      />

      <div className="w-full max-w-[420px] text-center space-y-6">
        {/* Brand */}
        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-glow-sm">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Verifying your email…</h1>
              <p className="text-sm text-muted-foreground">Just a moment</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
              <p className="text-sm text-muted-foreground">
                {message || 'Your account is now active. Sign in to get started.'}
              </p>
            </div>
            <Button
              asChild
              className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity"
            >
              <Link to="/login">Continue to sign in</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-2">
              <Button
                asChild
                className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity"
              >
                <Link to="/login">Go to sign in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-10 border-border/50">
                <Link to="/signup">Create a new account</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
