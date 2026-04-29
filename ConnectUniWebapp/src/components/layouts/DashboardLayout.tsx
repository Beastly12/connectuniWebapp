import { useState, useEffect, createContext, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Users, MessageSquare, Calendar, Briefcase, BookOpen,
  Bell, Settings, Globe, User, Search, Moon, Sun, LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { BackendRole } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { MobileAppLayout } from './MobileAppLayout'
import { getInitials } from '@/lib/utils'

// ─── Design tokens ───────────────────────────────────────────────────────────
export const C = {
  orange: '#EF4B24',
  charcoal: '#1A1A1A',
  white: '#FFFFFF',
  offWhite: '#F7F5F0',
  mint: '#D4E8B8',
  lavender: '#C8B8E0',
  border: '#E5E5E5',
  secondary: '#6B6B6B',
  tertiary: '#9A9A9A',
  darkBase: '#0E0E0E',
  darkCard: '#161616',
  darkBorder: '#2A2A2A',
  darkText: '#F5F5F5',
  pageBg: '#EDE9E3',
}

const AVATAR_COLORS = ['#C4705A', '#7A9E7E', '#C9972E', '#6B7FA3', '#8B6FA8', '#D4816B', '#5B8FA8', '#A87B5A']
export const avatarBg = (name: string) => AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]

// ─── Dark mode context ───────────────────────────────────────────────────────
export const DarkModeContext = createContext<{ dark: boolean; toggleDark: () => void }>({
  dark: false,
  toggleDark: () => {},
})
export const useDarkMode = () => useContext(DarkModeContext)

// ─── Nav config ──────────────────────────────────────────────────────────────
interface NavConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  label: string
  href: string
  roles?: BackendRole[]
}

const NAV_ITEMS: NavConfig[] = [
  { icon: Users,        label: 'Mentorship',  href: '/mentorship' },
  { icon: MessageSquare,label: 'Messages',    href: '/messages' },
  { icon: Briefcase,    label: 'Careers',     href: '/careers' },
  { icon: Calendar,     label: 'Events',      href: '/events' },
  { icon: BookOpen,     label: 'Resources',   href: '/resources' },
  { icon: Globe,        label: 'Community',   href: '/community' },
  { icon: Bell,         label: 'Notifications', href: '/notifications' },
  { icon: User,         label: 'Profile',     href: '/profile' },
  { icon: Settings,     label: 'Settings',    href: '/settings' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/alumni-dashboard': 'Dashboard',
  '/admin': 'Admin',
  '/mentorship': 'Mentorship',
  '/messages': 'Messages',
  '/community': 'Community',
  '/events': 'Events',
  '/careers': 'Careers',
  '/resources': 'Resources',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

// ─── Avatar circle ───────────────────────────────────────────────────────────
export function AvatarCircle({ name = '?', size = 36 }: { name?: string; size?: number }) {
  const initials = getInitials(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarBg(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: C.white,
      flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}

// ─── Logo ────────────────────────────────────────────────────────────────────
function Logo({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', background: C.orange,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" fill="white" opacity="0.9"/>
          <circle cx="10" cy="10" r="3" fill="white"/>
        </svg>
      </div>
      <div style={{ lineHeight: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: dark ? C.darkText : C.charcoal }}>Connect</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.orange }}>Uni</span>
      </div>
    </div>
  )
}

// ─── Sidebar nav item ────────────────────────────────────────────────────────
function SidebarItem({
  item, active, dark, badge, onClick,
}: {
  item: NavConfig
  active: boolean
  dark: boolean
  badge?: number
  onClick?: () => void
}) {
  const [hov, setHov] = useState(false)
  const IconComp = item.icon
  return (
    <Link
      to={item.href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 100,
        background: active
          ? C.orange
          : hov
            ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)')
            : 'transparent',
        color: active ? C.white : (dark ? C.darkText : C.charcoal),
        fontSize: 14, fontWeight: active ? 600 : 500,
        textDecoration: 'none',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
    >
      <IconComp style={{
        width: 16, height: 16, flexShrink: 0,
        color: active ? C.white : (dark ? '#A0A0A0' : C.secondary),
      }} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.3)' : C.orange,
          color: C.white, fontSize: 11, fontWeight: 700,
          borderRadius: 100, padding: '1px 7px', minWidth: 20, textAlign: 'center',
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

// ─── DashboardLayout ─────────────────────────────────────────────────────────
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, signOut } = useAuth()
  const { unreadCount } = useNotifications(profile?.user_id ?? undefined)
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('cu-dark')
      // Default to light mode (dark=false) if not set
      return saved === '1'
    } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('cu-dark', dark ? '1' : '0') } catch {}
    // Sync Tailwind theme: the CSS uses `.light` class for light mode (dark is :root default)
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  // Apply on mount to sync initial state
  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDark = () => setDark(d => !d)

  const homeHref =
    role === 'ADMIN' ? '/admin'
    : (role === 'ALUMNI' || role === 'MENTOR' || role === 'PROFESSIONAL') ? '/alumni-dashboard'
    : '/dashboard'

  const homeItem: NavConfig = { icon: Home, label: 'Home', href: homeHref }

  const visibleNav = [
    homeItem,
    ...NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role))),
  ]

  const pageTitle = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'ConnectUni'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (href: string) =>
    location.pathname === href || (href !== '/' && location.pathname.startsWith(href))

  const userName = profile?.full_name ?? 'User'

  return (
    <DarkModeContext.Provider value={{ dark, toggleDark }}>
      {/* ── Desktop (lg+) ── */}
      <div
        className="hidden lg:block"
        style={{
          height: '100vh',
          background: dark ? C.darkBase : C.pageBg,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          transition: 'background 0.3s',
          overflow: 'hidden',
        }}
      >
        {/* Floating Sidebar */}
        <div style={{
          position: 'fixed', left: 16, top: 16, bottom: 16, width: 240, zIndex: 100,
          background: dark ? '#161616' : C.white,
          borderRadius: 24,
          border: `1px solid ${dark ? C.darkBorder : C.border}`,
          boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 14px',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <Logo dark={dark} />
          </div>

          {/* Nav items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {visibleNav.map((item) => (
              <SidebarItem
                key={item.href + item.label}
                item={item}
                active={isActive(item.href)}
                dark={dark}
                badge={item.href === '/notifications' ? (unreadCount > 0 ? unreadCount : undefined) : undefined}
              />
            ))}
          </div>

          {/* User row */}
          <div style={{
            borderTop: `1px solid ${dark ? C.darkBorder : C.border}`,
            paddingTop: 16, marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Link to="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <AvatarCircle name={userName} size={38} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: dark ? C.darkText : C.charcoal,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {userName.split(' ')[0]}
              </div>
              <div style={{
                fontSize: 11, color: C.tertiary,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}>
                {role?.toLowerCase() ?? 'member'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.tertiary, padding: 4, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{
          marginLeft: 272, height: '100vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* TopBar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 24px 8px',
            flexShrink: 0,
          }}>
            {/* Breadcrumb */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: C.orange, fontSize: 16, lineHeight: 1 }}>•</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: dark ? C.darkText : C.charcoal }}>
                {pageTitle}
              </span>
            </div>

            {/* Search pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 100,
              background: dark ? '#1A1A1A' : C.white,
              border: `1px solid ${dark ? C.darkBorder : C.border}`,
              color: C.tertiary, fontSize: 13, cursor: 'text',
              userSelect: 'none',
            }}>
              <Search style={{ width: 14, height: 14, color: C.tertiary, flexShrink: 0 }} />
              <span>Search...</span>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${dark ? C.darkBorder : C.border}`,
                background: dark ? '#1A1A1A' : C.white,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {dark
                ? <Sun style={{ width: 16, height: 16, color: '#D0D0D0' }} />
                : <Moon style={{ width: 16, height: 16, color: C.secondary }} />
              }
            </button>

            {/* Bell */}
            <Link to="/notifications" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ position: 'relative', padding: 4, cursor: 'pointer' }}>
                <Bell style={{ width: 20, height: 20, color: dark ? '#D0D0D0' : C.secondary }} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 8, height: 8, borderRadius: '50%',
                    background: C.orange,
                    border: `2px solid ${dark ? C.darkBase : C.pageBg}`,
                  }} />
                )}
              </div>
            </Link>

            {/* Avatar */}
            <Link to="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <AvatarCircle name={userName} size={36} />
            </Link>
          </div>

          {/* Scrollable page content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 32px' }}>
            {children}
          </div>
        </div>
      </div>

      {/* ── Mobile (<lg) ── */}
      <div className="lg:hidden">
        <MobileAppLayout
          role={role}
          profile={profile}
          unreadCount={unreadCount}
          onSignOut={handleSignOut}
          sidebarOpen={sidebarOpen}
          onSidebarOpen={() => setSidebarOpen(true)}
          onSidebarClose={() => setSidebarOpen(false)}
          location={location}
        >
          {children}
        </MobileAppLayout>
      </div>
    </DarkModeContext.Provider>
  )
}
