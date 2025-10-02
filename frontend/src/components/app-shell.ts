import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { AISystem } from '../domain/models';
import { AuthController, ProjectController } from '../state/controllers';
import { navigateTo } from '../navigation';
import {
  t,
  supportedLanguages,
  getCurrentLanguage,
  onLanguageChanged,
  changeLanguage,
  type SupportedLanguage
} from '../shared/i18n';
import styles from '../styles.css?inline';

const NAVIGATION_ITEMS = [
  {
    label: 'Panel',
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
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>`
  },
  {
    label: 'Proyectos',
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
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
      />
    </svg>`
  },
  {
    label: 'Incidentes',
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>`
  },
  {
    label: 'Configuración',
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
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>`
  }
] as const;

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
export class AppShell extends LitElement {
  static styles = [css([styles] as any)];

  private readonly auth = new AuthController(this);
  private readonly projects = new ProjectController(this);

  @state() private mobileMenuOpen = false;
  @state() private language = getCurrentLanguage();

  private unsubscribeLanguageChange: (() => void) | null = null;

  private toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  private handleNavigate(href: string) {
    navigateTo(href);
    this.mobileMenuOpen = false;
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
    this.unsubscribeLanguageChange = onLanguageChanged((language) => {
      this.language = language;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeLanguageChange?.();
    this.unsubscribeLanguageChange = null;
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
    const activePath = window.location.pathname;
    return html`
      <nav class="menu px-4 py-6 text-base-content/80">
        ${NAVIGATION_ITEMS.map((item) => {
          const isActive =
            activePath === item.href || activePath.startsWith(`${item.href}/`);
          return html`
            <li>
              <a
                class=${classMap({ 'active font-semibold': isActive })}
                aria-current=${isActive ? 'page' : undefined}
                @click=${() => this.handleNavigate(item.href)}
              >
                <span class="flex items-center gap-3">
                  ${item.icon}
                  <span>${item.label}</span>
                </span>
              </a>
            </li>
          `;
        })}
        ${this.renderProjectSelectorMenuItems()}
        ${activeProject
          ? PROJECT_NAV_ITEMS.map((item) => {
              const href = item.getHref(activeProject.id);
              const isActive = activePath.startsWith(href);
              return html`
                <li>
                  <a
                    class=${classMap({ 'active font-semibold': isActive })}
                    aria-current=${isActive ? 'page' : undefined}
                    @click=${() => this.handleNavigate(href)}
                  >
                    <span class="flex items-center gap-3">
                      ${item.icon}
                      <span>${t(item.labelKey)}</span>
                    </span>
                  </a>
                </li>
              `;
            })
          : null}
      </nav>
    `;
  }

  private renderProjectSelectorMenuItems() {
    const projects = this.projects.projects;
    const activeProjectId = this.projects.activeProjectId ?? '';
    return html`
      <li class="menu-title mt-6">
        <span>Proyecto activo</span>
      </li>
      <li class="px-2">
        ${projects.length
          ? html`<select
              class="select select-bordered select-sm w-full"
              aria-label="Seleccionar proyecto activo"
              .value=${activeProjectId}
              @change=${this.handleProjectChange}
            >
              <option value="">Todos los proyectos</option>
              ${projects.map(
                (project) => html`<option value=${project.id}>${project.name}</option>`
              )}
            </select>`
          : html`<span class="text-sm text-base-content/70 block px-2 py-2"
              >Sin proyectos activos</span
            >`}
      </li>
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
            <span class="text-lg font-semibold">AI Act Compliance</span>
            <p class="text-sm text-base-content/60">Herramienta de seguimiento</p>
          </div>
          <div class="flex-1 overflow-y-auto">${this.renderNavigation(activeProject)}</div>
        </aside>

        <div class="flex-1 flex flex-col">
          <header class="navbar bg-base-100 border-b border-base-300 sticky top-0 z-20">
            <div class="flex-none lg:hidden">
              <button class="btn btn-ghost btn-square" @click=${this.toggleMenu}>
                <span class="text-2xl leading-none">☰</span>
              </button>
            </div>
            <div class="flex-1 flex flex-col lg:flex-row lg:items-center gap-2 px-4">
              <h1 class="text-xl font-semibold">${activeProject?.name ?? 'Panel de control'}</h1>
              ${activeProject
                ? html`<span class="badge badge-outline">${activeProject.role}</span>`
                : html`<span class="text-sm text-base-content/60">Selecciona un proyecto</span>`}
            </div>
            <div class="flex-none pr-4 flex items-center gap-3">
              <label class="form-control w-auto min-w-[8rem]">
                <span class="label py-0">
                  <span class="label-text text-sm font-medium">
                    ${t('app.languageLabel')}
                  </span>
                </span>
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
                <p class="text-sm font-semibold">${user?.full_name ?? 'Invitado'}</p>
                <p class="text-xs text-base-content/60">${user?.email ?? 'Sin sesión'}</p>
              </div>
              <button class="btn btn-sm" @click=${this.logout}>Cerrar sesión</button>
            </div>
          </header>

          <main class="flex-1 overflow-y-auto p-6">
            <slot></slot>
          </main>
        </div>
      </div>
    `;
  }
}
