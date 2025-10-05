import { html, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthController } from '../../state/controllers';
import { getNotificationSettings, type NotificationSetting } from './Settings.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { supportedLanguages, t } from '../../shared/i18n';
import type { ContactPreference, User } from '../../services/auth';
import type { SupportedLanguage } from '../../shared/i18n';

type ContactMethod = ContactPreference['method'];

@customElement('settings-page')
export class SettingsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private selected: Set<string> = new Set(['incidents', 'deliverables']);
  @state() private fullName = '';
  @state() private company = '';
  @state() private avatar = '';
  @state() private contactMethod: ContactMethod = 'email';
  @state() private contactValue = '';
  @state() private contactWorkspace = '';
  @state() private contactChannel = '';
  @state() private language: SupportedLanguage = supportedLanguages[0];
  @state() private isSaving = false;
  @state() private saveStatus: 'success' | 'error' | null = null;

  private syncedUser: User | null = null;

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

  protected override willUpdate(_changed: PropertyValues<this>): void {
    const user = this.auth.user ?? null;
    if (user !== this.syncedUser) {
      this.syncFormWithUser(user);
      this.syncedUser = user;
    }
  }

  private syncFormWithUser(user: User | null): void {
    if (!user) {
      this.fullName = '';
      this.company = '';
      this.avatar = '';
      this.contactMethod = 'email';
      this.contactValue = '';
      this.contactWorkspace = '';
      this.contactChannel = '';
      this.language = supportedLanguages[0];
      this.saveStatus = null;
      return;
    }

    const isDifferentUser = !this.syncedUser || this.syncedUser.id !== user.id;
    this.fullName = user.full_name ?? '';
    this.company = user.company ?? '';
    this.avatar = user.avatar ?? '';
    this.contactMethod = user.contact?.method ?? 'email';
    this.contactValue = user.contact?.value ?? '';
    this.contactWorkspace = user.contact?.workspace ?? '';
    this.contactChannel = user.contact?.channel ?? '';
    const preferredLanguage = user.preferences?.language;
    this.language = supportedLanguages.includes(preferredLanguage as SupportedLanguage)
      ? (preferredLanguage as SupportedLanguage)
      : supportedLanguages[0];
    if (isDifferentUser) {
      this.saveStatus = null;
    }
  }

  private get contactValueLabel(): string {
    const labels: Record<ContactMethod, string> = {
      email: t('auth.signup.contactEmail'),
      sms: t('auth.signup.contactPhoneSms'),
      whatsapp: t('auth.signup.contactPhoneWhatsapp'),
      slack: t('auth.signup.contactSlackUser')
    };
    return labels[this.contactMethod];
  }

  private async handleAccountSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const user = this.auth.user;
    if (!user) {
      return;
    }

    const trimmedName = this.fullName.trim();
    const trimmedCompany = this.company.trim();
    const trimmedAvatar = this.avatar.trim();
    const trimmedContactValue = this.contactValue.trim();
    const trimmedWorkspace = this.contactWorkspace.trim();
    const trimmedChannel = this.contactChannel.trim();

    const contact: ContactPreference = {
      method: this.contactMethod,
      value: trimmedContactValue
    };

    if (this.contactMethod === 'slack') {
      if (trimmedWorkspace) {
        contact.workspace = trimmedWorkspace;
      }
      if (trimmedChannel) {
        contact.channel = trimmedChannel;
      }
    }

    this.isSaving = true;
    this.saveStatus = null;
    try {
      await this.auth.value.updateProfile({
        full_name: trimmedName,
        company: trimmedCompany || null,
        avatar: trimmedAvatar || null,
        contact,
        preferences: { language: this.language }
      });
      this.saveStatus = 'success';
    } catch (error) {
      console.error('Failed to update profile', error);
      this.saveStatus = 'error';
    } finally {
      this.isSaving = false;
    }
  }

  protected render() {
    const user = this.auth.user;
    const notifications = getNotificationSettings();
    const hasUser = Boolean(user);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('settings.pageTitle')}</h1>
          <p class="text-base-content/70">${t('settings.pageSubtitle')}</p>
        </header>

        <article class="card bg-base-100 shadow">
          <form class="card-body space-y-6" @submit=${this.handleAccountSubmit}>
            <header class="flex flex-col gap-4 md:flex-row md:items-center">
              <div class="avatar">
                <div class="w-20 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200">
                  ${this.avatar
                    ? html`<img src=${this.avatar} alt=${t('settings.account.avatarAlt', { name: this.fullName || user?.full_name || '' })} />`
                    : html`<div class="w-full h-full flex items-center justify-center text-2xl font-semibold text-base-content/60 bg-base-300">
                        ${(this.fullName || user?.full_name || '?').slice(0, 1).toUpperCase()}
                      </div>`}
                </div>
              </div>
              <div class="space-y-1">
                <h2 class="card-title">${t('settings.account.title')}</h2>
                <p class="text-sm text-base-content/70">${t('settings.account.description')}</p>
                <p class="text-sm">
                  ${user?.email ?? t('settings.account.noSession')}
                </p>
              </div>
            </header>

            ${!hasUser
              ? html`<div class="alert alert-info text-sm">${t('settings.account.noSession')}</div>`
              : null}

            ${this.saveStatus === 'success'
              ? html`<div class="alert alert-success text-sm">${t('settings.account.feedback.success')}</div>`
              : null}
            ${this.saveStatus === 'error'
              ? html`<div class="alert alert-error text-sm">${t('settings.account.feedback.error')}</div>`
              : null}

            <fieldset class="grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.fullName')}</span></span>
                <input
                  class="input input-bordered"
                  .value=${this.fullName}
                  ?disabled=${!hasUser || this.isSaving}
                  required
                  @input=${(event: Event) => {
                    const input = event.currentTarget as HTMLInputElement;
                    this.fullName = input.value;
                  }}
                >
              </label>
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.company')}</span></span>
                <input
                  class="input input-bordered"
                  .value=${this.company}
                  ?disabled=${!hasUser || this.isSaving}
                  @input=${(event: Event) => {
                    const input = event.currentTarget as HTMLInputElement;
                    this.company = input.value;
                  }}
                >
              </label>
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.email')}</span></span>
                <input class="input input-bordered" .value=${user?.email ?? ''} disabled>
              </label>
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.avatar')}</span></span>
                <input
                  class="input input-bordered"
                  .value=${this.avatar}
                  ?disabled=${!hasUser || this.isSaving}
                  placeholder="https://"
                  @input=${(event: Event) => {
                    const input = event.currentTarget as HTMLInputElement;
                    this.avatar = input.value;
                  }}
                >
                <span class="label"><span class="label-text-alt text-xs">${t('settings.account.fields.avatarHint')}</span></span>
              </label>
            </fieldset>

            <fieldset class="grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.contactMethod')}</span></span>
                <select
                  class="select select-bordered"
                  .value=${this.contactMethod}
                  ?disabled=${!hasUser || this.isSaving}
                  @change=${(event: Event) => {
                    const select = event.currentTarget as HTMLSelectElement;
                    this.contactMethod = select.value as ContactMethod;
                  }}
                >
                  <option value="email">${t('auth.contactMethods.email')}</option>
                  <option value="sms">${t('auth.contactMethods.sms')}</option>
                  <option value="whatsapp">${t('auth.contactMethods.whatsapp')}</option>
                  <option value="slack">${t('auth.contactMethods.slack')}</option>
                </select>
              </label>
              <label class="form-control">
                <span class="label"><span class="label-text">${this.contactValueLabel}</span></span>
                <input
                  class="input input-bordered"
                  .value=${this.contactValue}
                  ?disabled=${!hasUser || this.isSaving}
                  required
                  @input=${(event: Event) => {
                    const input = event.currentTarget as HTMLInputElement;
                    this.contactValue = input.value;
                  }}
                >
              </label>
              ${this.contactMethod === 'slack'
                ? html`
                    <label class="form-control">
                      <span class="label"><span class="label-text">${t('auth.signup.slackWorkspace')}</span></span>
                      <input
                        class="input input-bordered"
                        .value=${this.contactWorkspace}
                        ?disabled=${!hasUser || this.isSaving}
                        @input=${(event: Event) => {
                          const input = event.currentTarget as HTMLInputElement;
                          this.contactWorkspace = input.value;
                        }}
                      >
                    </label>
                    <label class="form-control">
                      <span class="label"><span class="label-text">${t('auth.signup.slackChannel')}</span></span>
                      <input
                        class="input input-bordered"
                        .value=${this.contactChannel}
                        ?disabled=${!hasUser || this.isSaving}
                        @input=${(event: Event) => {
                          const input = event.currentTarget as HTMLInputElement;
                          this.contactChannel = input.value;
                        }}
                      >
                    </label>
                  `
                : null}
            </fieldset>

            <fieldset class="grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="label"><span class="label-text">${t('settings.account.fields.language')}</span></span>
                <select
                  class="select select-bordered"
                  .value=${this.language}
                  ?disabled=${!hasUser || this.isSaving}
                  @change=${(event: Event) => {
                    const select = event.currentTarget as HTMLSelectElement;
                    this.language = (select.value as SupportedLanguage);
                  }}
                >
                  ${supportedLanguages.map(
                    (language) => html`<option value=${language}>${t(`languages.${language}.full`)}</option>`
                  )}
                </select>
              </label>
            </fieldset>

            <div class="flex justify-end">
              <button class="btn btn-primary" type="submit" ?disabled=${!hasUser || this.isSaving}>
                ${this.isSaving ? t('settings.account.actions.saving') : t('settings.account.actions.save')}
              </button>
            </div>
          </form>
        </article>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold">${t('settings.notifications.title')}</h2>
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
