import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { AISystem } from '../domain/models';
import { AuthController, ProjectController } from '../state/controllers';
import { getCurrentPath, navigateTo } from '../navigation';
import {
  t,
  supportedLanguages,
  getCurrentLanguage,
  changeLanguage,
  type SupportedLanguage
} from '../shared/i18n';
import styles from '../styles.css?inline';
import { LocalizedElement } from '../shared/localized-element';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '0.1.0';

const NAVIGATION_ITEMS: ReadonlyArray<{
  labelKey: 'nav.dashboard' | 'nav.projects' | 'nav.incidents' | 'nav.settings';
  href: string;
  icon: ReturnType<typeof html>;
}> = [
  {
    labelKey: 'nav.dashboard',
    href: '/',
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V21h15V9.75"
      />
    </svg>`
  },
  {
    labelKey: 'nav.projects',
    href: '/projects',
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.379a1.5 1.5 0 0 1 1.06.44l1.121 1.12a1.5 1.5 0 0 0 1.06.44H19.5A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-11Z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 13.5h18"
      />
    </svg>`
  },
  {
    labelKey: 'nav.incidents',
    href: '/incidents',
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v3.75m0 3v.008h.008V15.75H12Zm9.53 3.75-7.5-13.5a1.125 1.125 0 0 0-1.96 0l-7.5 13.5A1.125 1.125 0 0 0 5.625 21h12.75a1.125 1.125 0 0 0 1.155-1.5Z"
      />
    </svg>`
  },
  {
    labelKey: 'nav.settings',
    href: '/settings',
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9.75 3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V4.5A.75.75 0 0 0 15 5.25h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75H18a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75h-3A.75.75 0 0 1 9.75 21v-1.5A.75.75 0 0 0 9 18.75H7.5a.75.75 0 0 1-.75-.75V16.5A.75.75 0 0 0 6 15.75H4.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75H6a.75.75 0 0 0 .75-.75V9a.75.75 0 0 1 .75-.75H9A.75.75 0 0 0 9.75 7.5Z"
      />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>`
  }
];

const PROJECT_NAV_ITEMS = [
  {
    labelKey: 'nav.project.evidences',
    getHref: (projectId: string) => `/projects/${projectId}/deliverables`,
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>`
  },
  {
    labelKey: 'nav.project.teams',
    getHref: (projectId: string) => `/projects/${projectId}/org`,
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>`
  },
  {
    labelKey: 'nav.project.audits',
    getHref: (projectId: string) => `/projects/${projectId}/audit`,
    icon: html`<svg
      class="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
      />
    </svg>`
  }
] as const;

@customElement('app-shell')
export class AppShell extends LocalizedElement {
  static styles = [css([styles] as any)];

  private readonly auth = new AuthController(this);
  private readonly projects = new ProjectController(this);

  @state() private mobileMenuOpen = false;
  @state() private language = getCurrentLanguage();
  @state() private isOnline = navigator.onLine;
  @state() private activePath = getCurrentPath();

  private readonly updateOnlineStatus = () => {
    this.isOnline = navigator.onLine;
  };

  private readonly syncActivePath = () => {
    this.activePath = getCurrentPath();
  };

  private toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  private handleNavigate(href: string) {
    navigateTo(href);
    this.mobileMenuOpen = false;
    this.syncActivePath();
  }

  private handleProjectChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    this.projects.value.setActiveProjectId(select.value || null);
  }

  private logout() {
    this.auth.value.logout();
    navigateTo('/login', { replace: true });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.language = getCurrentLanguage();
    this.syncActivePath();
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    window.addEventListener('popstate', this.syncActivePath);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    window.removeEventListener('popstate', this.syncActivePath);
  }

  protected override handleLanguageChanged(language: SupportedLanguage): void {
    this.language = language;
  }

  private handleLanguageChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    const selectedLanguage = select.value as SupportedLanguage;
    if (supportedLanguages.includes(selectedLanguage)) {
      this.language = selectedLanguage;
      changeLanguage(selectedLanguage);
    }
  }

  private renderNavigation(activeProject: AISystem | null) {
    const activePath = this.activePath;
    return html`
      <nav class="menu px-4 py-6 text-base-content/80">
        ${NAVIGATION_ITEMS.map((item) => html`
          <li>
            <a
              class=${classMap({ 'active font-semibold': activePath === item.href })}
              aria-current=${activePath === item.href ? 'page' : undefined}
              href=${item.href}
              @click=${() => this.handleNavigate(item.href)}
            >
              <span class="flex items-center gap-3">
                <span class="text-base-content/60">${item.icon}</span>
                <span>${t(item.labelKey)}</span>
              </span>
            </a>
          </li>
        `)}
      </nav>
      ${activeProject
        ? html`
            <nav class="menu px-4 pb-6 text-base-content/80">
              ${PROJECT_NAV_ITEMS.map((item) => {
                const href = item.getHref(activeProject.id);
                const isActive = activePath.startsWith(href);
                return html`
                  <li>
                    <a
                      class=${classMap({ 'active font-semibold': isActive })}
                      aria-current=${isActive ? 'page' : undefined}
                      href=${href}
                      @click=${() => this.handleNavigate(href)}
                    >
                      <span class="flex items-center gap-3">
                        <span class="text-base-content/60">${item.icon}</span>
                        <span>${t(item.labelKey)}</span>
                      </span>
                    </a>
                  </li>
                `;
              })}
            </nav>
          `
        : null}
    `;
  }

  private renderProjectSelectorMenuItems() {
    const projects = this.projects.projects;
    if (!projects.length) {
      return html`<span class="text-sm text-base-content/70">${t('app.projectSelector.empty')}</span>`;
    }
    return html`
      <label class="form-control w-full max-w-xs">
        <span class="label">
          <span class="label-text text-sm font-medium">${t('app.projectSelector.title')}</span>
        </span>
        <select class="select select-bordered select-sm" @change=${this.handleProjectChange}>
          <option value="">${t('app.projectSelector.all')}</option>
          ${projects.map((project) => html`
            <option value=${project.id} ?selected=${project.id === this.projects.activeProjectId}>
              ${project.name}
            </option>
          `)}
        </select>
      </label>
    `;
  }

  protected render() {
    const user = this.auth.user;
    const activeProject = this.projects.activeProject;
    const languageSelectId = 'language-select';

    return html`
      <div class="min-h-screen flex bg-base-200 text-base-content">
        <aside
          class=${classMap({
            'w-72 bg-base-100 border-r border-base-300 flex flex-col fixed inset-y-0 z-30 transform transition-transform lg:static lg:translate-x-0': true,
            '-translate-x-full lg:translate-x-0': !this.mobileMenuOpen,
            'translate-x-0': this.mobileMenuOpen
          })}
        >
          <div class="p-6 border-b border-base-300">
            <span class="text-lg font-semibold">${t('app.shortTitle')}</span>
            <p class="text-sm text-base-content/60">${t('app.sidebarSubtitle')}</p>
          </div>
          <div class="border-b border-base-300 px-6 py-4 space-y-3">
            ${this.renderProjectSelectorMenuItems()}
          </div>
          <div class="flex-1 overflow-y-auto">${this.renderNavigation(activeProject)}</div>
        </aside>

        <div class="flex-1 flex flex-col">
          <header class="bg-base-100 border-b border-base-300 sticky top-0 z-20">
            <div class="navbar gap-4 px-4 py-2">
              <div class="flex-none lg:hidden">
                <button class="btn btn-ghost btn-square btn-sm" @click=${this.toggleMenu} aria-label=${t('app.menuToggle')}>
                  <span class="text-xl leading-none">☰</span>
                </button>
              </div>
              <div class="flex items-center gap-3 flex-1 min-w-0">
                
                <div class="flex-1 flex justify-end lg:justify-center">
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
              <div class="flex items-center gap-4">
                <label class="form-control w-auto min-w-[8rem]">
                  <select
                    id=${languageSelectId}
                    class="select select-bordered select-sm"
                    aria-label=${t('app.languageSelectAria')}
                    .value=${this.language}
                    @change=${this.handleLanguageChange}
                  >
                    ${supportedLanguages.map(
                      (language) => html`
                        <option value=${language}>
                          ${t(`languages.${language}.full`)}
                        </option>
                      `
                    )}
                  </select>
                </label>
                <div class="text-right">
                  <p class="text-sm font-semibold">${user?.full_name ?? t('app.guestUser')}</p>
                  <p class="text-xs text-base-content/60">${user?.email ?? t('app.noSession')}</p>
                </div>
                <button class="btn btn-sm" @click=${this.logout}>${t('app.logout')}</button>
                <span class="hidden md:inline text-base-content/40">│</span>
              </div>
            </div>
            <div class="border-t border-base-300 px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-2">
              <h1 class="text-xl font-semibold flex-1">${activeProject?.name ?? t('app.layout.defaultProjectTitle')}</h1>
              ${activeProject
                ? html`<span class="badge badge-outline">${t(`roles.${activeProject.role}` as const)}</span>`
                : html`<span class="text-sm text-base-content/60">${t('app.layout.selectProjectHint')}</span>`}
            </div>
          </header>

          <main class="flex-1 overflow-y-auto p-6">
            <slot></slot>
          </main>

          <footer class="bg-base-100 border-t border-base-300 px-6 py-3 text-sm text-base-content/70 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              ${this.isOnline ? t('app.footer.online') : t('app.footer.offline')}
            </span>
            <span>${t('app.footer.version', { version: APP_VERSION })}</span>
          </footer>
        </div>
      </div>
    `;
  }
}
