import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage, tokens } from '@/lib/api'

export type BackendRole = 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN' | 'PROFESSIONAL'

export interface AuthUser {
  id: number
  email: string
}

export interface AuthProfile {
  id: number
  user_id: number
  full_name: string | null
  avatar_url: string | null
  headline: string | null
  bio: string | null
  university: string | null
  graduation_year: number | null
  major: string | null
  company: string | null
  job_title: string | null
  goals: string | null
  skills: string[] | null
  interests: string[] | null
}

interface AuthState {
  user: AuthUser | null
  profile: AuthProfile | null
  role: BackendRole | null
  loading: boolean
}

// ─── JWT decode (no library needed) ──────────────────────────────────────────

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

function userFromToken(token: string): AuthUser | null {
  const p = decodeJwt(token)
  if (!p || typeof p.uid !== 'number' || typeof p.sub !== 'string') return null
  return { id: p.uid as number, email: p.sub as string }
}

function roleFromToken(token: string): BackendRole | null {
  const p = decodeJwt(token)
  if (!p?.role) return null
  return p.role as BackendRole
}

// ─── Singleton broadcast so all hook instances stay in sync ──────────────────

type Listener = (s: AuthState) => void
let _state: AuthState = { user: null, profile: null, role: null, loading: true }
const _listeners = new Set<Listener>()

function broadcast(next: Partial<AuthState>) {
  _state = { ..._state, ...next }
  _listeners.forEach((l) => l(_state))
}

// ─── Boot: restore session from localStorage ─────────────────────────────────

let _booted = false
function boot() {
  if (_booted) return
  _booted = true

  const token = tokens.getAccess()
  if (!token) { broadcast({ loading: false }); return }

  const user = userFromToken(token)
  const role = roleFromToken(token)
  if (!user) { tokens.clear(); broadcast({ loading: false }); return }

  broadcast({ user, role })
  api.get<AuthProfile>('/profile/me')
    .then((profile) => broadcast({ profile, loading: false }))
    .catch(() => broadcast({ loading: false }))
}

boot()

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [state, setLocalState] = useState<AuthState>(_state)
  const qc = useQueryClient()

  useEffect(() => {
    setLocalState(_state) // sync immediately in case boot finished before mount
    _listeners.add(setLocalState)
    return () => { _listeners.delete(setLocalState) }
  }, [])

  async function signIn(email: string, password: string): Promise<Error | null> {
    try {
      const data = await api.loginForm<{ access_token: string; refresh_token: string }>(
        '/auth/login', email, password
      )
      qc.clear()
      tokens.set(data.access_token, data.refresh_token)
      const user = userFromToken(data.access_token)
      const role = roleFromToken(data.access_token)
      broadcast({ user, role })
      try {
        const profile = await api.get<AuthProfile>('/profile/me')
        broadcast({ profile })
      } catch { /* profile may not exist yet */ }
      return null
    } catch (err) {
      return new Error(getErrorMessage(err, 'Login failed'))
    }
  }

  async function signUp(payload: {
    email: string
    password: string
    full_name: string
    university_name: string
    graduation_year: number
    major: string
    role: string
  }): Promise<Error | null> {
    try {
      await api.postPublic('/auth/register', payload)
      return null
    } catch (err) {
      return new Error(getErrorMessage(err, 'Registration failed'))
    }
  }

  async function signOut(): Promise<void> {
    const rt = tokens.getRefresh()
    if (rt) {
      try { await api.post('/auth/logout', undefined, { refresh_token: rt }) } catch { /* ignore */ }
    }
    tokens.clear()
    qc.clear()
    broadcast({ user: null, profile: null, role: null, loading: false })
  }

  async function resetPassword(email: string): Promise<Error | null> {
    try {
      await api.postPublic('/auth/forgot-password', undefined, { email })
      return null
    } catch (err) {
      return new Error(getErrorMessage(err, 'Failed to send reset email'))
    }
  }

  async function refreshProfile(): Promise<void> {
    try {
      const profile = await api.get<AuthProfile>('/profile/me')
      broadcast({ profile })
    } catch { /* ignore */ }
  }

  return {
    user: state.user,
    profile: state.profile,
    role: state.role,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  }
}
