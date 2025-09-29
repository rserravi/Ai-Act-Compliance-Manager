import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { navigateTo } from '../../navigation';
import { AuthController } from '../../state/controllers';

type ContactMethod = 'email' | 'sms' | 'whatsapp' | 'slack';

@customElement('sign-in-page')
export class SignInPage extends LitElement {
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
      this.registrationId = response.registration_id;
      this.feedback = 'Introduce el código de verificación enviado a tu contacto.';
    } catch (error) {
      console.error(error);
      this.feedback = 'No se pudo completar el registro. Inténtalo más tarde.';
    }
  }

  private handleCodeInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    this.verificationCode = sanitized;
    input.value = sanitized;
  }

  private async handleVerificationSubmit(event: Event) {
    event.preventDefault();
    if (!this.registrationId) {
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

  private renderRegistrationForm() {
    return html`
      <form class="card-body space-y-4" @submit=${this.handleSubmit}>
        <header class="space-y-1 text-center">
          <h1 class="text-3xl font-bold">Crear cuenta</h1>
          <p class="text-base-content/70">Configura tu organización y comienza a trabajar con la plataforma.</p>
        </header>

        ${this.feedback ? html`<div class="alert alert-info text-sm">${this.feedback}</div>` : null}

        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">Nombre completo</span></span>
            <input class="input input-bordered" required .value=${this.fullName} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.fullName = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Compañía</span></span>
            <input class="input input-bordered" required .value=${this.company} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.company = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Correo profesional</span></span>
            <input class="input input-bordered" type="email" required .value=${this.email} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.email = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Contraseña</span></span>
            <input class="input input-bordered" type="password" required .value=${this.password} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.password = input.value;
            }}>
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">Método de contacto</span></span>
            <select class="select select-bordered" .value=${this.contactMethod} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.contactMethod = select.value as ContactMethod;
            }}>
              <option value="email">Correo</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="slack">Slack</option>
            </select>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Detalle de contacto</span></span>
            <input class="input input-bordered" required .value=${this.contactValue} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.contactValue = input.value;
            }}>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Idioma preferido</span></span>
            <select class="select select-bordered" .value=${this.language} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.language = select.value;
            }}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </label>
        </div>

        <button class="btn btn-primary" type="submit" ?disabled=${this.auth.isAuthenticating}>
          Registrar organización
        </button>

        <p class="text-sm text-base-content/70 text-center">
          ¿Ya tienes cuenta? <a class="link" href="/login">Inicia sesión</a>
        </p>
      </form>
    `;
  }

  private renderVerificationForm() {
    return html`
      <form class="card-body space-y-4" @submit=${this.handleVerificationSubmit}>
        <header class="space-y-1 text-center">
          <h1 class="text-3xl font-bold">Verifica tu cuenta</h1>
          <p class="text-base-content/70">Introduce el código de 8 caracteres enviado por tu método de contacto.</p>
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
          ¿Necesitas volver atrás?
          <button class="link" type="button" @click=${() => {
            this.registrationId = null;
            this.verificationCode = '';
            this.verificationError = null;
            this.feedback = null;
          }}>
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
          ${this.registrationId ? this.renderVerificationForm() : this.renderRegistrationForm()}
        </section>
      </main>
    `;
  }
}
