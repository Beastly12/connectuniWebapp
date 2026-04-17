import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { BackendRole } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: BackendRole[]
}

const dashboardMap: Record<BackendRole, string> = {
  STUDENT: '/dashboard',
  ALUMNI: '/alumni-dashboard',
  MENTOR: '/alumni-dashboard',
  PROFESSIONAL: '/alumni-dashboard',
  ADMIN: '/admin',
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardMap[role] ?? '/'} replace />
  }

  return <>{children}</>
}
