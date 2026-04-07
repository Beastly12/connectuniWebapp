/**
 * Thin fetch wrapper that:
 * - Attaches Authorization header from localStorage
 * - Auto-refreshes on 401 (one retry)
 * - Throws a plain Error with the server detail message on non-2xx
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokens = {
  getAccess: (): string | null => localStorage.getItem('access_token'),
  getRefresh: (): string | null => localStorage.getItem('refresh_token'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },
  clear: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

// ─── Refresh logic (called once on 401) ──────────────────────────────────────

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const rt = tokens.getRefresh()
  if (!rt) throw new Error('No refresh token')

  const res = await fetch(
    `${BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(rt)}`,
    { method: 'POST' }
  )
  if (!res.ok) {
    tokens.clear()
    throw new Error('Session expired. Please log in again.')
  }
  const data = await res.json()
  tokens.set(data.access_token, data.refresh_token)
  return data.access_token
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown
    formData?: FormData
    params?: Record<string, string | number | boolean | undefined>
    auth?: boolean        // default: true
    retry?: boolean       // internal: prevents infinite loop on refresh
  } = {}
): Promise<T> {
  const { body, formData, params, auth = true, retry = true } = options

  // Build URL
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }

  // Build headers
  const headers: Record<string, string> = {}
  if (auth) {
    const token = tokens.getAccess()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
    }
    const newToken = await refreshPromise
    return request<T>(method, path, {
      ...options,
      retry: false,
      auth: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void newToken
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const err = await res.json()
      message = err?.detail ?? err?.message ?? message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, { params }),

  post: <T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('POST', path, { body, params }),

  postForm: <T>(path: string, formData: FormData) =>
    request<T>('POST', path, { formData }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, { body }),

  putForm: <T>(path: string, formData: FormData) =>
    request<T>('PUT', path, { formData }),

  delete: <T = void>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('DELETE', path, { params }),

  /** POST with OAuth2 form-data (username + password) */
  loginForm: <T>(path: string, username: string, password: string) => {
    const fd = new FormData()
    fd.append('username', username)
    fd.append('password', password)
    return request<T>('POST', path, { formData: fd, auth: false })
  },

  /** POST without auth header */
  postPublic: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body, auth: false }),

  /** GET WebSocket URL with token */
  wsUrl: (path: string): string => {
    const token = tokens.getAccess() ?? ''
    const base = BASE_URL.replace(/^http/, 'ws')
    return `${base}${path}?token=${encodeURIComponent(token)}`
  },
}
