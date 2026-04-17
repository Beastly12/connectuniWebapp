import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  Globe,
  LayoutDashboard,
  MoreHorizontal,
  Bell,
  Settings,
  GraduationCap,
  LogOut,
  Briefcase,
  BookOpen,
  MessageSquare,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import type { BackendRole, AuthProfile } from '@/hooks/useAuth'
import type { Location } from 'react-router-dom'

interface MobileAppLayoutProps {
  children: React.ReactNode
  role: BackendRole | null
  profile: AuthProfile | null
  unreadCount: number
  onSignOut: () => void
  sidebarOpen: boolean
  onSidebarOpen: () => void
  onSidebarClose: () => void
  location: Location
}

const bottomTabs = [
  { label: 'Home', href: null, icon: LayoutDashboard, isDashboard: true },
  { label: 'Mentors', href: '/mentorship', icon: Users },
  { label: 'Community', href: '/community', icon: Globe },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'More', href: null, icon: MoreHorizontal, isMore: true },
] as const

export function MobileAppLayout({
  children,
  role,
  profile,
  unreadCount,
  onSignOut,
  sidebarOpen,
  onSidebarOpen,
  onSidebarClose,
  location,
}: MobileAppLayoutProps) {
  const getDashboardHref = () => {
    if (role === 'STUDENT') return '/dashboard'
    if (role === 'ALUMNI' || role === 'MENTOR') return '/alumni-dashboard'
    if (role === 'ADMIN') return '/admin'
    return '/dashboard'
  }

  const isActive = (href: string) =>
    location.pathname === href || (href !== '/' && location.pathname.startsWith(href))

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top header */}
      <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/90 backdrop-blur-md px-4 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-glow-sm">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text tracking-tight">ConnectUni</span>
        </div>
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="shrink-0 border-t border-border/30 bg-card/90 backdrop-blur-xl z-10">
        <div className="flex items-stretch h-16 px-2">
          {bottomTabs.map((tab) => {
            const href = 'isDashboard' in tab ? getDashboardHref() : ('isMore' in tab ? null : tab.href)
            const active = href ? isActive(href) : false

            if ('isMore' in tab) {
              return (
                <button
                  key="more"
                  type="button"
                  onClick={onSidebarOpen}
                  className="flex flex-1 flex-col items-center justify-center gap-1 relative"
                >
                  <tab.icon className="h-5 w-5 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/50 font-medium">{tab.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={tab.label}
                to={href ?? '#'}
                className="flex flex-1 flex-col items-center justify-center gap-1 relative"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full gradient-primary" />
                )}
                <tab.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground/50'
                  )}
                />
                <span className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground/50'
                )}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* More drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onSidebarClose} />
          <div className="absolute bottom-0 left-0 right-0 glass-card-strong rounded-t-2xl border-t border-border/30 p-4 space-y-1 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {getInitials(profile?.full_name ?? 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{profile?.full_name ?? 'User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role?.toLowerCase()}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSidebarClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {[
              { label: 'Careers', href: '/careers', icon: Briefcase },
              { label: 'Resources', href: '/resources', icon: BookOpen },
              { label: 'Messages', href: '/messages', icon: MessageSquare },
              { label: 'Notifications', href: '/notifications', icon: Bell },
              { label: 'Profile', href: '/profile', icon: LayoutDashboard },
              { label: 'Settings', href: '/settings', icon: Settings },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onSidebarClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent/40 transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50 mt-2">
              <button
                type="button"
                onClick={onSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
