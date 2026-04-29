import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { BackendRole } from '@/hooks/useAuth'

const dashboardMap: Record<BackendRole, string> = {
  STUDENT: '/dashboard',
  ALUMNI: '/alumni-dashboard',
  MENTOR: '/alumni-dashboard',
  PROFESSIONAL: '/alumni-dashboard',
  ADMIN: '/admin',
}

interface GuestRouteProps {
  children: React.ReactNode
}

/**
 * Renders children only when the user is NOT authenticated.
 * Authenticated users are redirected to their role dashboard.
 * Renders nothing while auth state is resolving (avoids flash).
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) return null

  if (user) {
    const destination = role ? (dashboardMap[role] ?? '/dashboard') : '/dashboard'
    return <Navigate to={destination} replace />
  }

  return <>{children}</>
}
