import { getStoredToken } from '../shared/auth-storage'

const baseUrl = import.meta.env.VITE_API_BASE

if (!baseUrl) {
  throw new Error('Missing VITE_API_BASE environment variable')
}

const BASE_URL = baseUrl.replace(/\/+$/, '')

function formatAuthorization(token: string): string {
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`
}

function resolveUrl(path: string) {
  if (/^https?:/i.test(path)) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${normalizedPath}`
}

export async function api<T>(path: string, init?: RequestInit, authToken?: string): Promise<T> {
  const storedToken = getStoredToken()
  const headers = new Headers(init?.headers ?? {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken) {
    headers.set('Authorization', formatAuthorization(authToken))
  } else if (storedToken && !headers.has('Authorization')) {
    headers.set('Authorization', formatAuthorization(storedToken))
  }

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  return (response.text() as unknown) as T
}

export async function tryApi<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary()
  } catch (error) {
    console.warn('API request failed, using fallback', error)
    return fallback()
  }
}
