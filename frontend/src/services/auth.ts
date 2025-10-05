import { api } from './api'

function requiredEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const LOGIN_ENDPOINT = requiredEnv('VITE_AUTH_LOGIN_ENDPOINT')
const LOGIN_SSO_ENDPOINT = requiredEnv('VITE_AUTH_LOGIN_SSO_ENDPOINT')
const REGISTRATION_INIT_ENDPOINT = requiredEnv('VITE_AUTH_REGISTRATION_INIT_ENDPOINT')
const PROFILE_ENDPOINT = requiredEnv('VITE_AUTH_PROFILE_ENDPOINT')
const AVATAR_ENDPOINT = requiredEnv('VITE_AUTH_AVATAR_ENDPOINT')
const REGISTRATION_VERIFY_ENDPOINT = requiredEnv('VITE_AUTH_REGISTRATION_VERIFY_ENDPOINT')
const REGISTRATION_RESEND_ENDPOINT = requiredEnv('VITE_AUTH_REGISTRATION_RESEND_ENDPOINT')

export interface ContactPreference {
  method: 'email' | 'sms' | 'whatsapp' | 'slack'
  value: string
  workspace?: string
  channel?: string
}

export interface User {
  id: string
  company?: string | null
  full_name: string
  email: string
  contact: ContactPreference
  avatar?: string | null
  preferences: UserPreferences
}

export interface UserPreferences {
  language: string
}

export interface LoginPayload {
  company: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface SSOLoginPayload {
  company: string
  email: string
  provider: string
}

export interface SignInPayload {
  full_name: string
  company: string
  email: string
  contact: ContactPreference
  avatar?: string
  password: string
  preferences: UserPreferences
}

export interface SignInResponse {
  registration_id: string
  message: string
  expires_at: string
}

export interface SignInVerificationPayload {
  registration_id: string
  code: string
}

export interface SignInVerificationResponse {
  token: string
  user: User
  message: string
}

export interface SignInVerificationResendPayload {
  registration_id: string
}

export interface UpdateProfilePayload {
  full_name: string
  company?: string | null
  contact: ContactPreference
  preferences: UserPreferences
}

export function login(payload: LoginPayload) {
  return api<LoginResponse>(LOGIN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function loginWithSSO(payload: SSOLoginPayload) {
  return api<LoginResponse>(LOGIN_SSO_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function signIn(payload: SignInPayload) {
  return api<SignInResponse>(REGISTRATION_INIT_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function verifySignIn(payload: SignInVerificationPayload) {
  return api<SignInVerificationResponse>(REGISTRATION_VERIFY_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function resendSignInCode(payload: SignInVerificationResendPayload) {
  return api<SignInResponse>(REGISTRATION_RESEND_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function fetchCurrentUser(token?: string) {
  return api<User>(PROFILE_ENDPOINT, undefined, token)
}

export function updateProfile(payload: UpdateProfilePayload) {
  return api<User>(PROFILE_ENDPOINT, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

export function uploadAvatar(file: File) {
  const body = new FormData()
  body.append('file', file)
  return api<User>(AVATAR_ENDPOINT, {
    method: 'POST',
    body
  })
}

export function deleteAvatar() {
  return api<User>(AVATAR_ENDPOINT, {
    method: 'DELETE'
  })
}
