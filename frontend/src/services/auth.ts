import { api } from './api'

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
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function loginWithSSO(payload: SSOLoginPayload) {
  return api<LoginResponse>('/auth/login/sso', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function signIn(payload: SignInPayload) {
  return api<SignInResponse>('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
