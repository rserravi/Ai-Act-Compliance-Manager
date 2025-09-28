import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearStoredAuth, getStoredToken, storeAuthState } from './auth-storage'

const STORAGE_KEY = 'aacm.auth'

declare global {
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis
}

describe('auth storage helpers', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    const localStorage = {
      getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key)
      })
    }

    ;(globalThis as unknown as { window: Window }).window = {
      localStorage
    } as Window

    clearStoredAuth()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('returns the cached token immediately after storing auth state', () => {
    const getItemSpy = vi.spyOn(window.localStorage, 'getItem')

    storeAuthState({ token: 'cached-token', user: { id: 'user-1' } })

    expect(getStoredToken()).toBe('cached-token')
    expect(getItemSpy).not.toHaveBeenCalled()
  })

  it('falls back to persisted storage when no cached token is available', () => {
    const persisted = { token: 'persisted-token', user: { id: 'user-2' } }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))

    const getItemSpy = vi.spyOn(window.localStorage, 'getItem')

    expect(getStoredToken()).toBe('persisted-token')
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY)

    getItemSpy.mockClear()
    expect(getStoredToken()).toBe('persisted-token')
    expect(getItemSpy).not.toHaveBeenCalled()
  })

  it('clears the cached token immediately when logging out', () => {
    const removeSpy = vi.spyOn(window.localStorage, 'removeItem')

    storeAuthState({ token: 'logout-token', user: null })
    clearStoredAuth()

    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY)

    const getItemSpy = vi.spyOn(window.localStorage, 'getItem')
    expect(getStoredToken()).toBeNull()
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('sends the cached Authorization header on the next API request', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://example.test')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers()
    })

    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('../services/api')

    storeAuthState({ token: 'fresh-token', user: null })

    await api('/auth/me')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.test/auth/me')

    const headers = init?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer fresh-token')
  })
})
