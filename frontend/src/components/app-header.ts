import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { AISystem } from '../domain/models';
import type { SupportedLanguage } from '../shared/i18n';
import { t } from '../shared/i18n';
import { LocalizedElement } from '../shared/localized-element';
import sharedStyles from '../styles.css?inline';

const styles = css`
  :host {
    display: block;
  }
`;

@customElement('app-header')
export class AppHeader extends LocalizedElement {
  static override styles = [css([sharedStyles] as any), styles];

  @property({ attribute: false }) activeProject: AISystem | null = null;
  @property({ type: String }) language: SupportedLanguage = 'en';
  @property({ attribute: false }) supportedLanguages: ReadonlyArray<SupportedLanguage> = [];
  @property({ type: String }) userFullName: string | null = null;
  @property({ type: String }) userEmail: string | null = null;
  @property({ type: Boolean }) mobileMenuOpen = false;

  private getUserInitials() {
    const nameSource = this.userFullName?.trim();
    if (nameSource) {
      const parts = nameSource.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        return parts[0]?.slice(0, 2).toUpperCase() ?? '?';
      }
      const first = parts[0]?.charAt(0) ?? '';
      const last = parts[parts.length - 1]?.charAt(0) ?? '';
      const initials = `${first}${last}`;
      return initials ? initials.toUpperCase() : '?';
    }

    const emailSource = this.userEmail?.trim();
    if (emailSource) {
      const firstLetter = emailSource.replace(/@.*/, '').charAt(0);
      if (firstLetter) {
        return firstLetter.toUpperCase();
      }
    }
    return '?';
  }

  private handleLanguageChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    this.dispatchEvent(
      new CustomEvent<SupportedLanguage>('language-change', {
        detail: select.value as SupportedLanguage,
        bubbles: true,
        composed: true
      })
    );
  }

  private requestPendingActions() {
    this.dispatchEvent(
      new CustomEvent('pending-actions', { bubbles: true, composed: true })
    );
  }

  private requestLogout() {
    this.dispatchEvent(new CustomEvent('logout', { bubbles: true, composed: true }));
  }

    private toggleMenu() {
    this.dispatchEvent(new CustomEvent('toggle-menu', { bubbles: true, composed: true }));
  }

  render() {
    const activeProject = this.activeProject;
    const languageSelectId = 'language-select';
    const languages = this.supportedLanguages.length
      ? this.supportedLanguages
      : ([this.language] as ReadonlyArray<SupportedLanguage>);

    return html`
      <header class="bg-base-100 border-b border-base-300 sticky top-0 z-20">
        <div class="navbar gap-4 px-4 py-2">
          <div class="flex-none lg:hidden">
            <button
              class="btn btn-ghost btn-square btn-sm"
              @click=${this.toggleMenu}
              aria-label=${t('app.menuToggle')}
              aria-expanded=${this.mobileMenuOpen ? 'true' : 'false'}
              aria-controls="app-main-navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
          <div class="flex items-center gap-3 flex-none">
            <img
              class="h-8 w-8"
              src="/assets/favicon-32x32.png"
              alt=${t('app.logoAlt')}
              width="32"
              height="32"
            />
            <div class="leading-tight">
              <p class="text-base font-semibold text-base-content">${t('app.shortTitle')}</p>
              <p class="text-xs text-base-content/70">${t('app.sidebarSubtitle')}</p>
            </div>
          </div>
          <div class="flex-1 min-w-0 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
            <div class="min-w-0">
              <div class="flex items-center gap-2 min-w-0">
                <h1 class="text-lg font-semibold truncate">
                  ${activeProject?.name ?? t('app.layout.defaultProjectTitle')}
                </h1>
              </div>
              ${activeProject
                ? null
                : html`<p class="text-xs text-base-content/60">${t('app.layout.selectProjectHint')}</p>`}
            </div>
            <div class="flex-1 w-full flex justify-start lg:justify-center">
              <label
                class="input input-bordered input-sm flex items-center gap-2 w-full max-w-md"
                aria-label=${t('app.searchAria')}
              >
                <input
                  class="grow bg-transparent outline-none"
                  type="search"
                  placeholder=${t('app.searchPlaceholder')}
                />
              </label>
            </div>
          </div>
          <div class="flex items-center gap-4 flex-none">
            <label class="form-control w-auto min-w-[8rem]">
              <select
                id=${languageSelectId}
                class="select select-bordered select-sm"
                aria-label=${t('app.languageSelectAria')}
                .value=${this.language}
                @change=${this.handleLanguageChange}
              >
                ${languages.map(
                  (language) => html`<option value=${language}>
                    ${t(`languages.${language}.full`)}
                  </option>`
                )}
              </select>
            </label>
            <div class="dropdown dropdown-end">
              <label
                tabindex="0"
                class="btn btn-ghost btn-circle avatar"
                aria-label=${t('app.userMenu.openMenu')}
              >
                <div
                  class="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold uppercase"
                >
                  ${this.getUserInitials()}
                </div>
              </label>
              <ul
                tabindex="0"
                class="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li class="menu-title px-2">
                  <span class="text-sm font-semibold">
                    ${this.userFullName?.trim() || this.userEmail || t('app.guestUser')}
                  </span>
                </li>
                <li>
                  <button type="button" class="justify-between" @click=${this.requestPendingActions}>
                    ${t('app.userMenu.pendingActions')}
                  </button>
                </li>
                <li>
                  <button type="button" class="justify-between" @click=${this.requestLogout}>
                    ${t('app.logout')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    `;
  }
}
