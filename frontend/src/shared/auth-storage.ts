export interface StoredAuthState<TUser = unknown> {
  token: string
  user: TUser | null
}

const STORAGE_KEY = 'aacm.auth'

function safeParse(raw: string | null) {
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch (error) {
    console.warn('Failed to parse stored auth state', error)
    return null
  }
}

export function readStoredAuth<TUser = unknown>(): StoredAuthState<TUser> | null {
  if (typeof window === 'undefined') return null
  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY))
  if (!parsed || typeof parsed !== 'object') return null
  const token = typeof parsed.token === 'string' ? parsed.token : null
  if (!token) return null
  const user = (parsed.user ?? null) as TUser | null
  return { token, user }
}

export function storeAuthState<TUser = unknown>(state: StoredAuthState<TUser> | null): void {
  if (typeof window === 'undefined') return
  if (!state) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: state.token, user: state.user ?? null })
  )
}

export function clearStoredAuth(): void {
  storeAuthState(null)
}

export function getStoredToken(): string | null {
  return readStoredAuth()?.token ?? null
}
