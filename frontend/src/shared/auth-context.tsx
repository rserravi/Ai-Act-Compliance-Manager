import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  LoginPayload,
  LoginResponse,
  SSOLoginPayload,
  SignInPayload,
  SignInResponse,
  User
} from '../services/auth'
import { fetchCurrentUser, login, loginWithSSO, signIn } from '../services/auth'
import { clearStoredAuth, readStoredAuth, storeAuthState } from './auth-storage'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticating: boolean
  isRestoringSession: boolean
  loginWithPassword: (payload: LoginPayload) => Promise<LoginResponse>
  loginWithSso: (payload: SSOLoginPayload) => Promise<LoginResponse>
  register: (payload: SignInPayload) => Promise<SignInResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: React.PropsWithChildren) {
  const stored = readStoredAuth<User>()
  const [user, setUser] = useState<User | null>(stored?.user ?? null)
  const [token, setToken] = useState<string | null>(stored?.token ?? null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(() => Boolean(stored?.token))

  useEffect(() => {
    if (!token) {
      setIsRestoringSession(false)
      setUser(null)
      clearStoredAuth()
      return
    }

    let cancelled = false
    if (!user) {
      setIsRestoringSession(true)
    }

    fetchCurrentUser()
      .then(profile => {
        if (cancelled) return
        setUser(profile)
      })
      .catch(error => {
        console.error('Failed to restore session', error)
        if (cancelled) return
        setUser(null)
        setToken(null)
        clearStoredAuth()
      })
      .finally(() => {
        if (!cancelled) {
          setIsRestoringSession(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (token) {
      storeAuthState({ token, user })
    } else {
      clearStoredAuth()
    }
  }, [token, user])

  const runAuthAction = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsAuthenticating(true)
    try {
      const result = await action()
      return result
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const loginWithPassword = useCallback(
    async (payload: LoginPayload) =>
      runAuthAction(async () => {
        const response = await login(payload)
        setToken(response.token)
        setUser(response.user)
        return response
      }),
    [runAuthAction]
  )

  const loginWithSso = useCallback(
    async (payload: SSOLoginPayload) =>
      runAuthAction(async () => {
        const response = await loginWithSSO(payload)
        setToken(response.token)
        setUser(response.user)
        return response
      }),
    [runAuthAction]
  )

  const register = useCallback(
    async (payload: SignInPayload) =>
      runAuthAction(() => signIn(payload)),
    [runAuthAction]
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    clearStoredAuth()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticating,
      isRestoringSession,
      loginWithPassword,
      loginWithSso,
      register,
      logout
    }),
    [isAuthenticating, isRestoringSession, loginWithPassword, loginWithSso, logout, register, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
