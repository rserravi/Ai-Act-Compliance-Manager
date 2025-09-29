import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthController } from '../../state/controllers';
import { getNotificationSettings, type NotificationSetting } from './Settings.viewmodel';

@customElement('settings-page')
export class SettingsPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private selected: Set<string> = new Set(['incidents', 'deliverables']);

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private toggleSetting(setting: NotificationSetting) {
    const next = new Set(this.selected);
    if (next.has(setting.id)) {
      next.delete(setting.id);
    } else {
      next.add(setting.id);
    }
    this.selected = next;
  }

  protected render() {
    const user = this.auth.user;
    const notifications = getNotificationSettings();

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Configuración</h1>
          <p class="text-base-content/70">Preferencias de cuenta y notificaciones personales.</p>
        </header>

        <article class="card bg-base-100 shadow">
          <div class="card-body space-y-2">
            <h2 class="card-title">Cuenta</h2>
            <p class="text-sm text-base-content/70">${user?.email ?? 'Sin sesión activa'}</p>
            <p class="text-sm">${user?.company ?? 'Organización no definida'}</p>
          </div>
        </article>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold">Notificaciones</h2>
          <div class="grid gap-4 md:grid-cols-2">
            ${notifications.map((setting) => html`
              <label class="card bg-base-100 shadow cursor-pointer">
                <div class="card-body">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">${setting.label}</span>
                    <input
                      type="checkbox"
                      class="toggle toggle-primary"
                      .checked=${this.selected.has(setting.id)}
                      @change=${() => this.toggleSetting(setting)}
                    >
                  </div>
                  <p class="text-sm text-base-content/70">${setting.description}</p>
                </div>
              </label>
            `)}
          </div>
        </section>
      </section>
    `;
  }
}
