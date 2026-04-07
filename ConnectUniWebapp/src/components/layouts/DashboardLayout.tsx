import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  MessageSquare,
  Calendar,
  Briefcase,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Globe,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { BackendRole } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { MobileAppLayout } from './MobileAppLayout'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: BackendRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
  { label: 'Dashboard', href: '/alumni-dashboard', icon: LayoutDashboard, roles: ['ALUMNI', 'MENTOR'] },
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'Mentorship', href: '/mentorship', icon: Users },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Community', href: '/community', icon: Globe },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Careers', href: '/careers', icon: Briefcase },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Notifications', href: '/notifications', icon: Bell },
]

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, signOut } = useAuth()
  const { unreadCount } = useNotifications(profile?.user_id ?? undefined)
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  )

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive =
      location.pathname === item.href ||
      (item.href !== '/' && location.pathname.startsWith(item.href))
    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-3 text-sm transition-all duration-200',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
            : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80'
        )}
      >
        {/* Active left bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full gradient-primary" />
        )}
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isActive
              ? 'text-sidebar-primary'
              : 'text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70'
          )}
        />
        <span className="flex-1">{item.label}</span>
        {item.href === '/notifications' && unreadCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[9px] font-bold text-white tabular-nums shadow-glow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Ambient mesh gradient */}
      <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-60" />

      {/* Brand */}
      <div className="relative flex h-[60px] items-center gap-3 px-4 border-b border-sidebar-border/50">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-glow-sm shrink-0">
          <GraduationCap className="h-4.5 w-4.5 text-white" style={{ height: '1.1rem', width: '1.1rem' }} />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight gradient-text">
            ConnectUni
          </span>
          <p className="text-[10px] text-sidebar-foreground/40 capitalize leading-none mt-0.5">
            {role?.toLowerCase() ?? 'platform'}
          </p>
        </div>
      </div>

      {/* Main nav */}
      <ScrollArea className="relative flex-1 px-2 py-3 scrollbar-thin">
        <nav className="space-y-0.5">
          {visibleNav.map((item) => (
            <NavLink key={item.href + item.label} item={item} />
          ))}
        </nav>

        <div className="my-3 mx-1 h-px bg-sidebar-border/60" />

        <nav className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="relative border-t border-sidebar-border/50 px-2 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent/40 transition-colors">
          <Link to="/profile" onClick={() => setSidebarOpen(false)} className="shrink-0">
            <div className="relative">
              <Avatar className="h-7 w-7 ring-1 ring-sidebar-primary/30">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px] font-semibold">
                  {getInitials(profile?.full_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-sidebar-background" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {profile?.full_name ?? 'User'}
            </p>
            <p className="text-[10px] text-sidebar-foreground/45 capitalize truncate">
              {role?.toLowerCase() ?? 'member'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-sidebar-foreground/35 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop layout (lg+) ── */}
      <div className="hidden lg:flex h-screen bg-background">
        <aside className="flex w-64 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
          <SidebarContent />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile layout (<lg) — bottom tabs ── */}
      <div className="lg:hidden">
        <MobileAppLayout
          role={role}
          profile={profile}
          unreadCount={unreadCount}
          onSignOut={handleSignOut}
          sidebarOpen={sidebarOpen}
          onSidebarOpen={() => setSidebarOpen(true)}
          onSidebarClose={() => setSidebarOpen(false)}
          visibleNav={visibleNav}
          location={location}
        >
          {children}
        </MobileAppLayout>
      </div>
    </>
  )
}
