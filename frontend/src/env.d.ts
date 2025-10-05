/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_AUTH_LOGIN_ENDPOINT: string
  readonly VITE_AUTH_LOGIN_SSO_ENDPOINT: string
  readonly VITE_AUTH_REGISTRATION_INIT_ENDPOINT: string
  readonly VITE_AUTH_REGISTRATION_VERIFY_ENDPOINT: string
  readonly VITE_AUTH_REGISTRATION_RESEND_ENDPOINT: string
  readonly VITE_AUTH_PROFILE_ENDPOINT: string
  readonly VITE_AUTH_AVATAR_ENDPOINT: string
  readonly VITE_APP_VERSION: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
