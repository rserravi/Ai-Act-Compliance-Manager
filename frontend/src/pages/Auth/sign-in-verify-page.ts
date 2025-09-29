import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { navigateTo } from '../../navigation';
import { AuthController } from '../../state/controllers';

@customElement('sign-in-verify-page')
export class SignInVerifyPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private registrationId: string | null = null;
  @state() private verificationCode = '';
  @state() private feedback: string | null = null;
  @state() private verificationError: string | null = null;

  private readonly handleLocationChange = () => {
    this.updateRegistrationIdFromLocation();
  };

  constructor() {
    super();
    this.updateRegistrationIdFromLocation();
  }

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('popstate', this.handleLocationChange);
  }

  disconnectedCallback(): void {
    window.removeEventListener('popstate', this.handleLocationChange);
    super.disconnectedCallback();
  }

  private updateRegistrationIdFromLocation(): void {
    const params = new URLSearchParams(window.location.search);
    const registrationId = params.get('registration_id');
    this.registrationId = registrationId?.trim() ? registrationId.trim() : null;
    if (!this.registrationId) {
      this.feedback = 'No encontramos un registro pendiente. Inicia un nuevo registro para continuar.';
    } else {
      this.feedback = null;
    }
  }

  private handleCodeInput(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    this.verificationCode = sanitized;
    input.value = sanitized;
  }

  private async handleVerificationSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.registrationId) {
      this.verificationError = 'No se encontró el registro. Vuelve a iniciar el proceso.';
      return;
    }

    if (this.verificationCode.length !== 8) {
      this.verificationError = 'Introduce los 8 caracteres del código enviado.';
      return;
    }

    this.verificationError = null;
    this.feedback = null;
    try {
      await this.auth.value.verifyRegistration({
        registration_id: this.registrationId,
        code: this.verificationCode
      });
      this.feedback = 'Autenticación completada. Redirigiendo a la plataforma...';
      navigateTo('/', { replace: true });
    } catch (error) {
      console.error(error);
      this.verificationError = 'El código no es válido. Verifica e inténtalo nuevamente.';
    }
  }

  private renderMissingRegistrationMessage() {
    return html`
      <div class="card-body space-y-6">
        <header class="space-y-1 text-center">
          <h1 class="text-3xl font-bold">Verificación no disponible</h1>
          <p class="text-base-content/70">
            ${this.feedback}
          </p>
        </header>

        <button class="btn btn-primary" type="button" @click=${() => navigateTo('/sign-in')}>
          Volver al registro
        </button>
      </div>
    `;
  }

  private renderVerificationForm() {
    return html`
      <form class="card-body space-y-4" @submit=${this.handleVerificationSubmit}>
        <header class="space-y-1 text-center">
          <h1 class="text-3xl font-bold">Verifica tu cuenta</h1>
          <p class="text-base-content/70">
            Introduce el código de 8 caracteres enviado por tu método de contacto.
          </p>
        </header>

        ${this.feedback ? html`<div class="alert alert-info text-sm">${this.feedback}</div>` : null}
        ${this.verificationError ? html`<div class="alert alert-error text-sm">${this.verificationError}</div>` : null}

        <label class="form-control">
          <span class="label"><span class="label-text">Código de verificación</span></span>
          <input
            class="input input-bordered text-center tracking-widest"
            required
            minlength="8"
            maxlength="8"
            pattern="[A-Za-z0-9]{8}"
            placeholder="XXXXXXXX"
            autocomplete="one-time-code"
            .value=${this.verificationCode}
            @input=${this.handleCodeInput}
          >
        </label>

        <button class="btn btn-primary" type="submit" ?disabled=${this.auth.isAuthenticating || this.verificationCode.length !== 8}>
          Verificar y acceder
        </button>

        <p class="text-sm text-base-content/70 text-center">
          ¿Necesitas modificar tus datos?
          <button class="link" type="button" @click=${() => navigateTo('/sign-in')}>
            Editar registro
          </button>
        </p>
      </form>
    `;
  }

  protected render() {
    return html`
      <main class="min-h-screen flex items-center justify-center bg-base-200">
        <section class="card w-full max-w-2xl bg-base-100 shadow-xl">
          ${this.registrationId ? this.renderVerificationForm() : this.renderMissingRegistrationMessage()}
        </section>
      </main>
    `;
  }
}
