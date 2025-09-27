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
const SIGN_IN_ENDPOINT = requiredEnv('VITE_AUTH_SIGNIN_ENDPOINT')
const PROFILE_ENDPOINT = requiredEnv('VITE_AUTH_PROFILE_ENDPOINT')

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
  email: string
  contact: ContactPreference
  avatar?: string
}

export interface SignInResponse {
  user: User
  temporary_password: string
  message: string
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
  return api<SignInResponse>(SIGN_IN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function fetchCurrentUser() {
  return api<User>(PROFILE_ENDPOINT)
}
