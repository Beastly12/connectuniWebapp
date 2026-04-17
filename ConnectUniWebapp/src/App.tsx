import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute'
import { OnboardingGuard } from '@/components/layouts/OnboardingGuard'

import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import CheckEmailPage from '@/pages/auth/CheckEmailPage'
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage'
import ProfileSetupPage from '@/pages/onboarding/ProfileSetupPage'
import MentorshipPrefsPage from '@/pages/onboarding/MentorshipPrefsPage'
import StudentDashboard from '@/pages/StudentDashboard'
import AlumniDashboard from '@/pages/AlumniDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import MentorshipPage from '@/pages/MentorshipPage'
import MessagesPage from '@/pages/MessagesPage'
import CommunityPage from '@/pages/CommunityPage'
import NotificationsPage from '@/pages/NotificationsPage'
import EventsPage from '@/pages/EventsPage'
import CareersPage from '@/pages/CareersPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import ResourcesPage from '@/pages/ResourcesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/check-email" element={<CheckEmailPage />} />
          <Route path="/auth/verify-email" element={<EmailVerificationPage />} />

          {/* ── Onboarding routes (auth required, no onboarding guard) ── */}
          <Route
            path="/onboarding/profile"
            element={
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/mentorship"
            element={
              <ProtectedRoute>
                <MentorshipPrefsPage />
              </ProtectedRoute>
            }
          />

          {/* ── Student dashboard ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <OnboardingGuard>
                  <StudentDashboard />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* ── Alumni / Professional / Mentor dashboard ── */}
          <Route
            path="/alumni-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ALUMNI', 'MENTOR', 'PROFESSIONAL']}>
                <OnboardingGuard>
                  <AlumniDashboard />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* ── Admin dashboard ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Shared authenticated routes ── */}
          <Route
            path="/mentorship"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <MentorshipPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <MessagesPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <CommunityPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <NotificationsPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <EventsPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/careers"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <CareersPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <ResourcesPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <ProfilePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <SettingsPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
