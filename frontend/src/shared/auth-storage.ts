export interface StoredAuthState<TUser = unknown> {
  token: string
  user: TUser | null
}

const STORAGE_KEY = 'aacm.auth'

let latestToken: string | null = null
let _latestUser: unknown | null = null

function updateLatestAuthState<TUser>(state: StoredAuthState<TUser> | null) {
  latestToken = state?.token ?? null
  _latestUser = (state?.user ?? null) as unknown
}

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
  if (!parsed || typeof parsed !== 'object') {
    updateLatestAuthState<unknown>(null)
    return null
  }
  const token = typeof parsed.token === 'string' ? parsed.token : null
  if (!token) {
    updateLatestAuthState<unknown>(null)
    return null
  }
  const user = (parsed.user ?? null) as TUser | null
  const state: StoredAuthState<TUser> = { token, user }
  updateLatestAuthState(state)
  return state
}

export function storeAuthState<TUser = unknown>(state: StoredAuthState<TUser> | null): void {
  updateLatestAuthState(state)
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
  updateLatestAuthState<unknown>(null)
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getStoredToken(): string | null {
  if (latestToken !== null) {
    return latestToken
  }
  return readStoredAuth()?.token ?? null
}
