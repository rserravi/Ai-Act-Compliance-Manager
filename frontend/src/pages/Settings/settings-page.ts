import { html, type PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { AuthController } from '../../state/controllers';
import { getNotificationSettings, type NotificationSetting } from './Settings.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { supportedLanguages, t } from '../../shared/i18n';
import type { ContactPreference, User } from '../../services/auth';
import type { SupportedLanguage } from '../../shared/i18n';

type ContactMethod = ContactPreference['method'];

const MAX_AVATAR_MB = 2;
const MAX_AVATAR_BYTES = MAX_AVATAR_MB * 1024 * 1024;

@customElement('settings-page')
export class SettingsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly auth = new AuthController(this);

  @state() private selected: Set<string> = new Set(['incidents', 'deliverables']);
  @state() private fullName = '';
  @state() private company = '';
  @state() private avatar = '';
  @state() private avatarPreview: string | null = null;
  @state() private avatarFileName = '';
  @state() private avatarError: string | null = null;
  @state() private contactMethod: ContactMethod = 'email';
  @state() private contactValue = '';
  @state() private contactWorkspace = '';
  @state() private contactChannel = '';
  @state() private language: SupportedLanguage = supportedLanguages[0];
  @state() private isSaving = false;
  @state() private saveStatus: 'success' | 'error' | null = null;

  @query('#avatar-input') private avatarInputElement?: HTMLInputElement;

  private syncedUser: User | null = null;
  private pendingAvatarFile: File | null = null;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  public override disconnectedCallback(): void {
    this.revokeAvatarPreview();
    super.disconnectedCallback();
  }

  private revokeAvatarPreview(): void {
    if (this.avatarPreview) {
      URL.revokeObjectURL(this.avatarPreview);
      this.avatarPreview = null;
    }
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
      this.revokeAvatarPreview();
      this.pendingAvatarFile = null;
      this.avatarFileName = '';
      this.avatarError = null;
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
    this.revokeAvatarPreview();
    this.pendingAvatarFile = null;
    this.avatarFileName = '';
    this.avatarError = null;
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
    this.avatarError = null;
    try {
      if (this.pendingAvatarFile) {
        try {
          const updatedUser = await this.auth.value.uploadAvatar(this.pendingAvatarFile);
          this.avatar = updatedUser.avatar ?? '';
          this.pendingAvatarFile = null;
          this.avatarFileName = '';
          this.avatarInputElement && (this.avatarInputElement.value = '');
          this.revokeAvatarPreview();
        } catch (error) {
          console.error('Failed to upload avatar', error);
          this.avatarError = t('settings.account.errors.avatarUploadFailed');
          throw error;
        }
      }

      await this.auth.value.updateProfile({
        full_name: trimmedName,
        company: trimmedCompany || null,
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

  private clearPendingAvatarSelection(): void {
    this.pendingAvatarFile = null;
    this.avatarFileName = '';
    this.revokeAvatarPreview();
    if (this.avatarInputElement) {
      this.avatarInputElement.value = '';
    }
  }

  private handleAvatarChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.saveStatus = null;
    this.avatarError = null;
    this.revokeAvatarPreview();

    if (!file) {
      this.clearPendingAvatarSelection();
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      this.clearPendingAvatarSelection();
      this.avatarError = t('settings.account.errors.avatarTooLarge', {
        maxMb: MAX_AVATAR_MB
      });
      return;
    }

    this.pendingAvatarFile = file;
    this.avatarFileName = file.name;
    this.avatarPreview = URL.createObjectURL(file);
    if (this.avatarInputElement) {
      this.avatarInputElement.value = '';
    }
  }

  private async removeAvatar(): Promise<void> {
    const user = this.auth.user;
    if (!user) {
      return;
    }
    this.isSaving = true;
    this.saveStatus = null;
    this.avatarError = null;
    try {
      const updatedUser = await this.auth.value.removeAvatar();
      this.avatar = updatedUser.avatar ?? '';
      this.saveStatus = 'success';
    } catch (error) {
      console.error('Failed to remove avatar', error);
      this.saveStatus = 'error';
    } finally {
      this.isSaving = false;
      this.clearPendingAvatarSelection();
    }
  }

  protected render() {
    const user = this.auth.user;
    const notifications = getNotificationSettings();
    const hasUser = Boolean(user);
    const avatarSource = this.avatarPreview ?? this.avatar;
    const hasPendingAvatar = Boolean(this.pendingAvatarFile);
    const canRemoveStoredAvatar = Boolean(this.avatar && !hasPendingAvatar);

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
                  ${avatarSource
                    ? html`<img src=${avatarSource} alt=${t('settings.account.avatarAlt', { name: this.fullName || user?.full_name || '' })} />`
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
                  id="avatar-input"
                  class="file-input file-input-bordered"
                  type="file"
                  accept="image/*"
                  ?disabled=${!hasUser || this.isSaving}
                  @change=${this.handleAvatarChange}
                >
                ${this.avatarFileName
                  ? html`<span class="label-text-alt text-xs truncate">${this.avatarFileName}</span>`
                  : null}
                <span class="label"><span class="label-text-alt text-xs">${t('settings.account.fields.avatarHint', { maxMb: MAX_AVATAR_MB })}</span></span>
                ${this.avatarError
                  ? html`<span class="text-sm text-error">${this.avatarError}</span>`
                  : null}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${hasPendingAvatar
                    ? html`<button
                        type="button"
                        class="btn btn-ghost btn-sm"
                        ?disabled=${this.isSaving}
                        @click=${() => {
                          this.avatarError = null;
                          this.saveStatus = null;
                          this.clearPendingAvatarSelection();
                        }}
                      >
                        ${t('settings.account.actions.clearAvatarSelection')}
                      </button>`
                    : null}
                  ${canRemoveStoredAvatar
                    ? html`<button
                        type="button"
                        class="btn btn-ghost btn-sm"
                        ?disabled=${!hasUser || this.isSaving}
                        @click=${this.removeAvatar}
                      >
                        ${t('settings.account.actions.removeAvatar')}
                      </button>`
                    : null}
                </div>
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
