import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Sparkles, Users, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import type { BackendRole } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { signIn, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? null

  function getDashboard(r: BackendRole | null) {
    if (r === 'ADMIN') return '/admin'
    if (r === 'ALUMNI' || r === 'MENTOR') return '/alumni-dashboard'
    return '/dashboard'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const error = await signIn(email, password)
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      navigate(from ?? getDashboard(role), { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col relative overflow-hidden shrink-0">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-primary" />
        {/* Mesh overlay */}
        <div className="absolute inset-0 mesh-gradient" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        />
        {/* Grid dots overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col h-full px-10 py-10 justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/25">
              <GraduationCap className="h-4.5 w-4.5 text-white" style={{ height: '1.1rem', width: '1.1rem' }} />
            </div>
            <span className="text-sm font-bold text-white/90 tracking-tight">ConnectUni</span>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-[2rem] font-bold text-white leading-tight tracking-tight">
                Where students<br />
                meet alumni<br />
                <span className="text-white/70">who give back.</span>
              </h2>
              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[280px]">
                Connect with mentors, discover careers, and grow your network — all in one place.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                { icon: Sparkles, text: 'Find the right mentor for your goals' },
                { icon: Trophy, text: 'Access exclusive alumni career insights' },
                { icon: Users, text: 'Discover events and opportunities' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 border border-white/15 backdrop-blur-sm">
                    <item.icon className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <p className="text-sm text-white/65 font-medium">{item.text}</p>
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
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative">
        {/* Subtle ambient glow */}
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

        <div className="relative w-full max-w-[360px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to ConnectUni</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="h-10 bg-muted/50 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-10 bg-muted/50 border-border/60 focus:border-primary/60 focus:ring-primary/20 pr-10 transition-colors"
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
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
