const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

interface ApiHooks {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  onRefreshed: (accessToken: string, refreshToken: string) => void
  onAuthFailure: () => void
}

let hooks: ApiHooks = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onRefreshed: () => {},
  onAuthFailure: () => {},
}

// Called once by the auth store so this module stays free of pinia imports
// (avoids a circular dependency: store → api → store).
export function configureApi(next: ApiHooks) {
  hooks = next
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function rawRequest<T>(
  path: string,
  init: RequestInit,
  withAuth: boolean,
): Promise<{ status: number; body: T }> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (withAuth) {
    const token = hooks.getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }
  return { status: res.status, body: body as T }
}

let refreshing: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = hooks.getRefreshToken()
  if (!refreshToken) return false
  const { status, body } = await rawRequest<{
    accessToken: string
    refreshToken: string
  }>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }, false)
  if (status === 200 && body) {
    hooks.onRefreshed(body.accessToken, body.refreshToken)
    return true
  }
  return false
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null))
  return refreshing
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean } = {},
): Promise<T> {
  const withAuth = opts.auth !== false
  let { status, body } = await rawRequest<T>(path, init, withAuth)
  if (status === 401 && withAuth) {
    if (await tryRefresh()) {
      ;({ status, body } = await rawRequest<T>(path, init, true))
    }
    if (status === 401) {
      hooks.onAuthFailure()
      throw new ApiError(401, 'Session expired')
    }
  }
  if (status >= 400) {
    const message =
      (body as { message?: string } | null)?.message ?? `Request failed (${status})`
    throw new ApiError(status, Array.isArray(message) ? message.join(', ') : message)
  }
  return body
}

export const apiGet = <T>(path: string) => api<T>(path, { method: 'GET' })
export const apiPost = <T>(path: string, data?: unknown, opts?: { auth?: boolean }) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }, opts)
export const apiPatch = <T>(path: string, data?: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) })
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' })
