import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, hsl(var(--gradient-via) / 0.15), transparent 70%)' }}
      />

      <div className="relative mb-8 flex flex-col items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <GraduationCap className="h-5.5 w-5.5 text-white" style={{ height: '1.3rem', width: '1.3rem' }} />
        </div>
        <span className="text-base font-bold gradient-text">ConnectUni</span>
      </div>

      <div className="relative w-full max-w-[360px]">
        {sent ? (
          <div className="flex flex-col items-center gap-5 text-center glass-card rounded-2xl p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We sent a password reset link to{' '}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button variant="outline" className="w-full h-10 border-border/50" onClick={() => setSent(false)}>
                Try again
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full h-10 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="h-10 pl-9 bg-muted/50 border-border/60 focus:border-primary/60"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold gradient-primary border-0 text-white shadow-glow hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </span>
                ) : 'Send reset link'}
              </Button>
            </form>

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
