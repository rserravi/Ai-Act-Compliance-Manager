/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_AUTH_LOGIN_ENDPOINT: string
  readonly VITE_AUTH_LOGIN_SSO_ENDPOINT: string
  readonly VITE_AUTH_SIGNIN_ENDPOINT: string
  readonly VITE_AUTH_PROFILE_ENDPOINT: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
