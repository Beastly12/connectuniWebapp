/**
 * API client that:
 * - Attaches Authorization header from localStorage
 * - Auto-refreshes on 401 (one retry)
 * - Normalizes backend failures into ApiError instances
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
// const BASE_URL = "http://localhost:8000"

type QueryParamValue = string | number | boolean | undefined

export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown
  code?: string

  constructor({
    message,
    status,
    statusText,
    data,
    code,
  }: {
    message: string
    status: number
    statusText: string
    data?: unknown
    code?: string
  }) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.statusText = statusText
    this.data = data
    this.code = code
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function humanizeKey(key: string): string {
  return key.replace(/[_-]+/g, " ").trim()
}

function uniq(messages: string[]): string[] {
  return [...new Set(messages.map((message) => message.trim()).filter(Boolean))]
}

function flattenErrorMessages(value: unknown, label?: string): string[] {
  if (value == null) return []

  if (typeof value === "string") {
    const message = value.trim()
    if (!message) return []
    return label ? [`${humanizeKey(label)}: ${message}`] : [message]
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const message = String(value)
    return label ? [`${humanizeKey(label)}: ${message}`] : [message]
  }

  if (Array.isArray(value)) {
    const messages = value.flatMap((item) => {
      if (isPlainObject(item) && typeof item.msg === "string") {
        const location = Array.isArray(item.loc)
          ? item.loc
              .map(String)
              .filter((part) => !["body", "query", "path", "response"].includes(part))
              .join(".")
          : ""

        return flattenErrorMessages(item.msg, location || label)
      }

      return flattenErrorMessages(item, label)
    })

    return uniq(messages)
  }

  if (isPlainObject(value)) {
    const priorityKeys = [
      "detail",
      "details",
      "message",
      "error",
      "errors",
      "non_field_errors",
    ]

    for (const key of priorityKeys) {
      const nested = flattenErrorMessages(value[key])
      if (nested.length > 0) return nested
    }

    const messages = Object.entries(value).flatMap(([key, nested]) => {
      if (["status", "status_code", "code", "title", "type"].includes(key)) {
        return []
      }

      return flattenErrorMessages(nested, key)
    })

    return uniq(messages)
  }

  return []
}

function getDefaultErrorMessage(status: number, statusText: string): string {
  if (status === 0) {
    return "Unable to reach the server. Please check your connection and try again."
  }

  switch (status) {
    case 400:
      return "We could not complete that request."
    case 401:
      return "Authentication failed. Please sign in and try again."
    case 403:
      return "You do not have permission to do that."
    case 404:
      return "The requested resource could not be found."
    case 409:
      return "That action conflicts with the current state."
    case 422:
      return "Please review the highlighted fields and try again."
    case 429:
      return "Too many requests. Please wait a moment and try again."
    default:
      return status >= 500
        ? "Something went wrong on the server. Please try again."
        : statusText
          ? `${status} ${statusText}`
          : "Something went wrong. Please try again."
  }
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return undefined

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function toApiError(
  res: Response,
  data: unknown,
  fallbackMessage?: string,
): ApiError {
  const messages = flattenErrorMessages(data)
  const message = messages.join("; ") || fallbackMessage || getDefaultErrorMessage(res.status, res.statusText)
  const code = isPlainObject(data) && typeof data.code === "string" ? data.code : undefined

  return new ApiError({
    message,
    status: res.status,
    statusText: res.statusText,
    data,
    code,
  })
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message || fallback

  const extracted = flattenErrorMessages(error).join("; ")
  return extracted || fallback
}

async function performFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error) {
    throw new ApiError({
      message: getDefaultErrorMessage(0, ""),
      status: 0,
      statusText: "NETWORK_ERROR",
      data: error,
    })
  }
}

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokens = {
  getAccess: (): string | null => localStorage.getItem("access_token"),
  getRefresh: (): string | null => localStorage.getItem("refresh_token"),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ─── Refresh logic (called once on 401) ──────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const rt = tokens.getRefresh();
  if (!rt) {
    throw new ApiError({
      message: "Session expired. Please log in again.",
      status: 401,
      statusText: "UNAUTHORIZED",
    })
  }

  const res = await performFetch(
    `${BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(rt)}`,
    { method: "POST" },
  );
  if (!res.ok) {
    const data = await parseResponseBody(res)
    tokens.clear();
    throw toApiError(res, data, "Session expired. Please log in again.");
  }

  const data = await parseResponseBody(res)
  if (
    !isPlainObject(data)
    || typeof data.access_token !== "string"
    || typeof data.refresh_token !== "string"
  ) {
    throw new ApiError({
      message: "The server returned an invalid session response.",
      status: res.status,
      statusText: res.statusText,
      data,
    })
  }

  tokens.set(data.access_token, data.refresh_token);
  return data.access_token;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    formData?: FormData;
    params?: Record<string, QueryParamValue>;
    auth?: boolean; // default: true
    retry?: boolean; // internal: prevents infinite loop on refresh
  } = {},
): Promise<T> {
  const { body, formData, params, auth = true, retry = true } = options;

  // Build URL
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (auth) {
    const token = tokens.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (body !== undefined && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await performFetch(url.toString(), {
    method,
    headers,
    body: formData
      ? formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;
    return request<T>(method, path, {
      ...options,
      retry: false,
      auth: true,
    });
  }

  const data = res.status === 204 ? undefined : await parseResponseBody(res)

  if (!res.ok) {
    throw toApiError(res, data);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return data as T;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export const api = {
  get: <T>(
    path: string,
    params?: Record<string, QueryParamValue>,
  ) => request<T>("GET", path, { params }),

  post: <T>(
    path: string,
    body?: unknown,
    params?: Record<string, QueryParamValue>,
  ) => request<T>("POST", path, { body, params }),

  postForm: <T>(path: string, formData: FormData) =>
    request<T>("POST", path, { formData }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),

  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),

  putForm: <T>(path: string, formData: FormData) =>
    request<T>("PUT", path, { formData }),

  delete: <T = void>(
    path: string,
    params?: Record<string, QueryParamValue>,
  ) => request<T>("DELETE", path, { params }),

  /** POST with OAuth2 form-data (username + password) */
  loginForm: <T>(path: string, username: string, password: string) => {
    const fd = new FormData();
    fd.append("username", username);
    fd.append("password", password);
    return request<T>("POST", path, { formData: fd, auth: false });
  },

  /** POST without auth header */
  postPublic: <T>(
    path: string,
    body?: unknown,
    params?: Record<string, QueryParamValue>,
  ) => request<T>("POST", path, { body, params, auth: false }),

  /** GET WebSocket URL with token */
  wsUrl: (path: string): string => {
    const token = tokens.getAccess() ?? "";
    const base = BASE_URL.replace(/^http/, "ws");
    return `${base}${path}?token=${encodeURIComponent(token)}`;
  },
};
