import { useLocation, Link } from 'react-router-dom'
import { GraduationCap, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''
  const isAcUk = email.toLowerCase().endsWith('.ac.uk')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      {/* Ambient glow */}
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

        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Mail className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
          {email ? (
            isAcUk ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                We've sent a verification link to{' '}
                <span className="font-medium text-foreground">{email}</span>.{' '}
                Verifying this will confirm your student status.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                We've sent a verification link to{' '}
                <span className="font-medium text-foreground">{email}</span>.{' '}
                Click the link to activate your account.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a verification link to your email. Click it to activate your account.
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-left space-y-2.5">
          {[
            "Check your spam folder if you don't see it",
            'The link expires after 24 hours',
            'You must verify before you can sign in',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>

        <Button asChild variant="outline" className="w-full h-10 border-border/50">
          <Link to="/login">Go to sign in</Link>
        </Button>
      </div>
    </div>
  )
}
