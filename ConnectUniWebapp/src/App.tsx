import { Suspense, lazy, useEffect } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

type BackendRole = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN' | 'PROFESSIONAL'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const AppProviders = lazy(() => import('@/components/layouts/AppProviders').then((m) => ({ default: m.AppProviders })))
const ProtectedRoute = lazy(() => import('@/components/layouts/ProtectedRoute').then((m) => ({ default: m.ProtectedRoute })))
const OnboardingGuard = lazy(() => import('@/components/layouts/OnboardingGuard').then((m) => ({ default: m.OnboardingGuard })))
const GuestRoute = lazy(() => import('@/components/layouts/GuestRoute').then((m) => ({ default: m.GuestRoute })))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const CheckEmailPage = lazy(() => import('@/pages/auth/CheckEmailPage'))
const EmailVerificationPage = lazy(() => import('@/pages/auth/EmailVerificationPage'))
const ProfileSetupPage = lazy(() => import('@/pages/onboarding/ProfileSetupPage'))
const MentorshipPrefsPage = lazy(() => import('@/pages/onboarding/MentorshipPrefsPage'))
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'))
const AlumniDashboard = lazy(() => import('@/pages/AlumniDashboard'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const MentorshipPage = lazy(() => import('@/pages/MentorshipPage'))
const MessagesPage = lazy(() => import('@/pages/MessagesPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const EventsPage = lazy(() => import('@/pages/EventsPage'))
const CareersPage = lazy(() => import('@/pages/CareersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'))

const dashboardMap: Record<BackendRole, string> = {
  STUDENT: '/dashboard',
  ALUMNI: '/alumni-dashboard',
  MENTOR: '/alumni-dashboard',
  PROFESSIONAL: '/alumni-dashboard',
  ADMIN: '/admin',
}

function roleFromStoredToken(): BackendRole | null {
  const token = localStorage.getItem('access_token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload?.role === 'string' ? payload.role as BackendRole : null
  } catch {
    return null
  }
}

function LandingRoute() {
  const role = roleFromStoredToken()

  if (role) {
    return <Navigate to={dashboardMap[role] ?? '/dashboard'} replace />
  }

  return <LandingPage />
}

function withAppProviders(children: ReactNode) {
  return <AppProviders>{children}</AppProviders>
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* ── Public routes (guest only) ── */}
          <Route path="/login" element={<AppProviders><GuestRoute><LoginPage /></GuestRoute></AppProviders>} />
          <Route path="/signup" element={<AppProviders><GuestRoute><SignupPage /></GuestRoute></AppProviders>} />
          <Route path="/forgot-password" element={<AppProviders><GuestRoute><ForgotPasswordPage /></GuestRoute></AppProviders>} />
          <Route path="/auth/check-email" element={<AppProviders><CheckEmailPage /></AppProviders>} />
          <Route path="/auth/verify-email" element={<AppProviders><EmailVerificationPage /></AppProviders>} />

          {/* ── Onboarding routes (auth required, no onboarding guard) ── */}
          <Route
            path="/onboarding/profile"
            element={withAppProviders(
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/onboarding/mentorship"
            element={withAppProviders(
              <ProtectedRoute>
                <MentorshipPrefsPage />
              </ProtectedRoute>,
            )}
          />

          {/* ── Student dashboard ── */}
          <Route
            path="/dashboard"
            element={withAppProviders(
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <OnboardingGuard>
                  <StudentDashboard />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />

          {/* ── Alumni / Professional / Mentor dashboard ── */}
          <Route
            path="/alumni-dashboard"
            element={withAppProviders(
              <ProtectedRoute allowedRoles={['ALUMNI', 'MENTOR', 'PROFESSIONAL']}>
                <OnboardingGuard>
                  <AlumniDashboard />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />

          {/* ── Admin dashboard ── */}
          <Route
            path="/admin"
            element={withAppProviders(
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>,
            )}
          />

          {/* ── Shared authenticated routes ── */}
          <Route
            path="/mentorship"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <MentorshipPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/messages"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <MessagesPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/community"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <CommunityPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/notifications"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <NotificationsPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/events"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <EventsPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/careers"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <CareersPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/resources"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <ResourcesPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/profile"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <ProfilePage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />
          <Route
            path="/settings"
            element={withAppProviders(
              <ProtectedRoute>
                <OnboardingGuard>
                  <SettingsPage />
                </OnboardingGuard>
              </ProtectedRoute>,
            )}
          />

          {/* ── Landing / Catch-all ── */}
            <Route path="/" element={<LandingRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  )
}
