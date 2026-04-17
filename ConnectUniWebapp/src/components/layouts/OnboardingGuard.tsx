import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useFullProfile, hasRoleProfile } from '@/hooks/useOnboarding'

/**
 * Wraps protected dashboard routes.
 * If onboarding is incomplete, redirects to the correct next step.
 * Must be placed inside a ProtectedRoute (auth is already confirmed there).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading, isFetching, isError } = useFullProfile()

  // Wait for both the initial load AND any in-flight background refetch.
  // Without the isFetching check, navigating away from MentorshipPrefsPage
  // right after submission can land here while the cache still holds stale
  // data (mentorship_preferences: null), causing an infinite redirect loop.
  if (isLoading || isFetching) {
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

  // If the full profile can't be fetched (e.g., new user with no role profile yet),
  // route to profile setup. ProtectedRoute has already confirmed auth is valid.
  if (isError || !profile) {
    return <Navigate to="/onboarding/profile" replace />
  }

  if (!hasRoleProfile(profile)) {
    return <Navigate to="/onboarding/profile" replace />
  }

  if (!profile.mentorship_preferences) {
    return <Navigate to="/onboarding/mentorship" replace />
  }

  return <>{children}</>
}
