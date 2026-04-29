import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useFullProfile, hasRoleProfile } from '@/hooks/useOnboarding'
import { ApiError, getErrorMessage } from '@/lib/api'

/**
 * Wraps protected dashboard routes.
 * If onboarding is incomplete, redirects to the correct next step.
 * Must be placed inside a ProtectedRoute (auth is already confirmed there).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading, isFetching, isError, error } = useFullProfile()

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

  // A missing profile should go to onboarding, but transport/server failures should
  // not be mistaken for incomplete onboarding.
  if (error instanceof ApiError && error.status === 401) {
    return <Navigate to="/login" replace />
  }

  if (error instanceof ApiError && error.status === 404) {
    return <Navigate to="/onboarding/profile" replace />
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center px-6">
        <div className="max-w-md space-y-3 text-center">
          <h2 className="text-lg font-semibold">We couldn&apos;t load your profile</h2>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error, 'Please refresh and try again.')}
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
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
