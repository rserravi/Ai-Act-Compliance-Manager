import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthController } from '../../state/controllers';
import { navigateTo } from '../../navigation';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('login-page')
export class LoginPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private company = '';
  @state() private email = '';
  @state() private password = '';
  @state() private error: string | null = null;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get redirectPath() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') ?? '/';
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    try {
      await this.auth.value.login({
        company: this.company.trim(),
        email: this.email.trim(),
        password: this.password
      });
      navigateTo(this.redirectPath, { replace: true });
    } catch (error) {
      console.error(error);
      this.error = t('auth.feedback.loginError');
    }
  }

  private async handleSSO() {
    this.error = null;
    try {
      await this.auth.value.loginWithSSO({
        company: this.company.trim(),
        email: this.email.trim(),
        provider: 'sso'
      });
      navigateTo(this.redirectPath, { replace: true });
    } catch (error) {
      console.error(error);
      this.error = t('auth.feedback.ssoError');
    }
  }

  protected render() {
    return html`
      <main class="min-h-screen flex items-center justify-center bg-base-200">
        <section class="card w-full max-w-lg bg-base-100 shadow-xl">
          <form class="card-body space-y-4" @submit=${this.handleSubmit}>
            <header class="space-y-1 text-center">
              <h1 class="text-3xl font-bold">${t('auth.login.title')}</h1>
              <p class="text-base-content/70">${t('auth.login.subtitle')}</p>
            </header>

            ${this.error ? html`<div class="alert alert-error text-sm">${this.error}</div>` : null}

            <label class="form-control">
              <span class="label"><span class="label-text">${t('auth.fields.company')}</span></span>
              <input class="input input-bordered" required .value=${this.company} @input=${(event: Event) => {
                const input = event.currentTarget as HTMLInputElement;
                this.company = input.value;
              }}>
            </label>

            <label class="form-control">
              <span class="label"><span class="label-text">${t('auth.fields.email')}</span></span>
              <input class="input input-bordered" type="email" required .value=${this.email} @input=${(event: Event) => {
                const input = event.currentTarget as HTMLInputElement;
                this.email = input.value;
              }}>
            </label>

            <label class="form-control">
              <span class="label"><span class="label-text">${t('auth.fields.password')}</span></span>
              <input class="input input-bordered" type="password" required .value=${this.password} @input=${(event: Event) => {
                const input = event.currentTarget as HTMLInputElement;
                this.password = input.value;
              }}>
            </label>

            <button class="btn btn-primary" type="submit" ?disabled=${this.auth.isAuthenticating}>
              ${t('auth.login.submit')}
            </button>

            <div class="divider">${t('auth.login.or')}</div>

            <button class="btn btn-outline" type="button" @click=${this.handleSSO} ?disabled=${this.auth.isAuthenticating}>
              ${t('auth.login.ssoButton')}
            </button>

            <p class="text-xs text-base-content/60 text-center">
              ${t('auth.login.ssoHint')}
            </p>

            <p class="text-sm text-base-content/70 text-center">
              ${t('auth.login.noAccount')}
              <a class="link" href="/sign-in">${t('auth.login.goToSignUp')}</a>
            </p>
          </form>
        </section>
      </main>
    `;
  }
}
