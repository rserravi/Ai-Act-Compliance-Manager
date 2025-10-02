import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { navigateTo } from '../../navigation';
import { AuthController } from '../../state/controllers';
import { LocalizedElement } from '../../shared/localized-element';
import { t, supportedLanguages } from '../../shared/i18n';

type ContactMethod = 'email' | 'sms' | 'whatsapp' | 'slack';

@customElement('sign-in-page')
export class SignInPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private fullName = '';
  @state() private company = '';
  @state() private email = '';
  @state() private password = '';
  @state() private contactMethod: ContactMethod = 'email';
  @state() private contactValue = '';
  @state() private language = 'es';
  @state() private feedback: string | null = null;
  @state() private registrationId: string | null = null;
  @state() private verificationCode = '';
  @state() private verificationError: string | null = null;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    this.feedback = null;
    this.registrationId = null;
    this.verificationCode = '';
    this.verificationError = null;
    try {
      const response = await this.auth.value.register({
        full_name: this.fullName,
        company: this.company,
        email: this.email,
        password: this.password,
        contact: { method: this.contactMethod, value: this.contactValue },
        preferences: { language: this.language }
      });
      if (response.registration_id) {
        navigateTo(`/sign-in/verify/${encodeURIComponent(response.registration_id)}`);
      } else {
        this.feedback = t('auth.feedback.signUpVerificationError');
      }
    } catch (error) {
      console.error(error);
      this.feedback = t('auth.feedback.signUpError');
    }
  }

  private renderRegistrationForm() {
    const contactValueLabels: Record<ContactMethod, string> = {
      email: t('auth.signup.contactEmail'),
      sms: t('auth.signup.contactPhoneSms'),
      whatsapp: t('auth.signup.contactPhoneWhatsapp'),
      slack: t('auth.signup.contactSlackUser')
    };
    const selectedContactLabel = contactValueLabels[this.contactMethod];

    return html`
      <form class="card-body space-y-4" @submit=${this.handleSubmit}>
        <header class="space-y-1 text-center">
          <h1 class="text-3xl font-bold">${t('auth.signup.title')}</h1>
          <p class="text-base-content/70">${t('auth.signup.subtitle')}</p>
        </header>

        ${this.feedback ? html`<div class="alert alert-info text-sm">${this.feedback}</div>` : null}

        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.fullName')}</span></span>
            <input class="input input-bordered" required .value=${this.fullName} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.fullName = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.company')}</span></span>
            <input class="input input-bordered" required .value=${this.company} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.company = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.email')}</span></span>
            <input class="input input-bordered" type="email" required .value=${this.email} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.email = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.password')}</span></span>
            <input class="input input-bordered" type="password" required .value=${this.password} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.password = input.value;
            }}>
            <span class="label"><span class="label-text-alt text-xs">${t('auth.signup.passwordHelper')}</span></span>
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.contactLabel')}</span></span>
            <select class="select select-bordered" .value=${this.contactMethod} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.contactMethod = select.value as ContactMethod;
            }}>
              <option value="email">${t('auth.contactMethods.email')}</option>
              <option value="sms">${t('auth.contactMethods.sms')}</option>
              <option value="whatsapp">${t('auth.contactMethods.whatsapp')}</option>
              <option value="slack">${t('auth.contactMethods.slack')}</option>
            </select>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${selectedContactLabel}</span></span>
            <input class="input input-bordered" required .value=${this.contactValue} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.contactValue = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('auth.signup.language')}</span></span>
            <select class="select select-bordered" .value=${this.language} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.language = select.value;
            }}>
              ${supportedLanguages.map(
                (language) => html`
                  <option value=${language}>${t(`languages.${language}.full`)}</option>
                `
              )}
            </select>
          </label>
        </div>

        <button class="btn btn-primary" type="submit" ?disabled=${this.auth.isAuthenticating}>
          ${t('auth.signup.submit')}
        </button>

        <p class="text-sm text-base-content/70 text-center">
          ${t('auth.signup.hasAccount')} <a class="link" href="/login">${t('auth.signup.goToLogin')}</a>
        </p>
      </form>
    `;
  }

  protected render() {
    return html`
      <main class="min-h-screen flex items-center justify-center bg-base-200">
        <section class="card w-full max-w-2xl bg-base-100 shadow-xl">
          ${this.renderRegistrationForm()}

        </section>
      </main>
    `;
  }
}
