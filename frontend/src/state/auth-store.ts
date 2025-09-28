import {
  fetchCurrentUser,
  login,
  loginWithSSO,
  resendSignInCode,
  signIn,
  verifySignIn,
  type LoginPayload,
  type LoginResponse,
  type SignInPayload,
  type SignInResponse,
  type SignInVerificationPayload,
  type SignInVerificationResendPayload,
  type SignInVerificationResponse,
  type SSOLoginPayload,
  type User
} from '../services/auth';
import { clearStoredAuth, readStoredAuth, storeAuthState } from '../shared/auth-storage';
import { ObservableValue } from './observable';

export class AuthStore {
  readonly user = new ObservableValue<User | null>(null);
  readonly token = new ObservableValue<string | null>(null);
  readonly isAuthenticating = new ObservableValue<boolean>(false);
  readonly isRestoringSession = new ObservableValue<boolean>(false);

  #restorePromise: Promise<void> | null = null;
  #hasAttemptedRestore = false;

  constructor() {
    const stored = readStoredAuth<User>();
    if (stored?.token) {
      this.token.value = stored.token;
      if (stored.user) {
        this.user.value = stored.user;
      }
      this.isRestoringSession.value = true;
      this.#hasAttemptedRestore = true;
      this.#restorePromise = this.#restoreSession(stored.token, !stored.user);
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.user.value && this.token.value);
  }

  async ensureSessionRestored(): Promise<void> {
    if (this.#restorePromise) {
      return this.#restorePromise;
    }
    if (this.#hasAttemptedRestore) {
      return Promise.resolve();
    }
    this.#hasAttemptedRestore = true;
    const token = this.token.value;
    if (!token) {
      this.isRestoringSession.value = false;
      return Promise.resolve();
    }
    this.isRestoringSession.value = true;
    this.#restorePromise = this.#restoreSession(token, !this.user.value);
    return this.#restorePromise;
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    return this.#runAuthAction(async () => {
      const response = await login(payload);
      this.#applySession(response.token, response.user);
      return response;
    });
  }

  async loginWithSSO(payload: SSOLoginPayload): Promise<LoginResponse> {
    return this.#runAuthAction(async () => {
      const response = await loginWithSSO(payload);
      this.#applySession(response.token, response.user);
      return response;
    });
  }

  async register(payload: SignInPayload): Promise<SignInResponse> {
    return this.#runAuthAction(async () => signIn(payload));
  }

  async verifyRegistration(payload: SignInVerificationPayload): Promise<SignInVerificationResponse> {
    return this.#runAuthAction(async () => {
      const response = await verifySignIn(payload);
      this.#applySession(response.token, response.user);
      return response;
    });
  }

  async resendRegistrationCode(payload: SignInVerificationResendPayload): Promise<SignInResponse> {
    return this.#runAuthAction(async () => resendSignInCode(payload));
  }

  logout(): void {
    this.token.value = null;
    this.user.value = null;
    this.isRestoringSession.value = false;
    this.isAuthenticating.value = false;
    this.#restorePromise = null;
    this.#hasAttemptedRestore = false;
    clearStoredAuth();
  }

  #applySession(token: string, user: User): void {
    this.token.value = token;
    this.user.value = user;
    this.isRestoringSession.value = false;
    storeAuthState({ token, user });
  }

  async #restoreSession(token: string, needsProfile: boolean): Promise<void> {
    try {
      if (!token) {
        this.logout();
        return;
      }
      this.isRestoringSession.value = true;
      if (needsProfile || !this.user.value) {
        const profile = await fetchCurrentUser(token);
        if (this.token.value !== token) {
          return;
        }
        this.user.value = profile;
        storeAuthState({ token, user: profile });
      } else {
        storeAuthState({ token, user: this.user.value });
      }
    } catch (error) {
      console.error('Failed to restore session', error);
      if (this.token.value === token) {
        this.logout();
      }
    } finally {
      if (this.token.value === token) {
        this.isRestoringSession.value = false;
      }
      this.#restorePromise = null;
    }
  }

  async #runAuthAction<T>(action: () => Promise<T>): Promise<T> {
    this.isAuthenticating.value = true;
    try {
      const result = await action();
      return result;
    } finally {
      this.isAuthenticating.value = false;
    }
  }
}

export const authStore = new AuthStore();

export type AuthStoreType = AuthStore;
