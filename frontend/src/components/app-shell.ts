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
  { label: 'Panel', href: '/' },
  { label: 'Proyectos', href: '/projects' },
  { label: 'Incidentes', href: '/incidents' },
  { label: 'Configuración', href: '/settings' }
] as const;

const PROJECT_NAV_ITEMS = [
  {
    labelKey: 'nav.project.evidences',
    getHref: (projectId: string) => `/projects/${projectId}/deliverables`
  },
  {
    labelKey: 'nav.project.teams',
    getHref: (projectId: string) => `/projects/${projectId}/org`
  },
  {
    labelKey: 'nav.project.audits',
    getHref: (projectId: string) => `/projects/${projectId}/audit`
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
    const active = window.location.pathname;
    return html`
      <nav class="menu px-4 py-6 text-base-content/80">
        ${NAVIGATION_ITEMS.map((item) => html`
          <li>
            <a
              class=${classMap({ 'active font-semibold': active === item.href })}
              aria-current=${active === item.href ? 'page' : undefined}
              @click=${() => this.handleNavigate(item.href)}
            >
              ${item.label}
            </a>
          </li>
        `)}
      </nav>
      ${activeProject
        ? html`
            <nav class="menu px-4 pb-6 text-base-content/80">
              ${PROJECT_NAV_ITEMS.map((item) => {
                const href = item.getHref(activeProject.id);
                const isActive = active.startsWith(href);
                return html`
                  <li>
                    <a
                      class=${classMap({ 'active font-semibold': isActive })}
                      aria-current=${isActive ? 'page' : undefined}
                      @click=${() => this.handleNavigate(href)}
                    >
                      ${t(item.labelKey)}
                    </a>
                  </li>
                `;
              })}
            </nav>
          `
        : null}
    `;
  }

  private renderProjectSelector() {
    const projects = this.projects.projects;
    if (!projects.length) {
      return html`<span class="text-sm text-base-content/70">Sin proyectos activos</span>`;
    }
    return html`
      <label class="form-control w-full max-w-xs">
        <span class="label">
          <span class="label-text text-sm font-medium">Proyecto activo</span>
        </span>
        <select class="select select-bordered select-sm" @change=${this.handleProjectChange}>
          <option value="">Todos los proyectos</option>
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
            <span class="text-lg font-semibold">AI Act Compliance</span>
            <p class="text-sm text-base-content/60">Herramienta de seguimiento</p>
          </div>
          <div class="flex-1 overflow-y-auto">${this.renderNavigation(activeProject)}</div>
          <div class="p-6 border-t border-base-300 space-y-2">
            ${this.renderProjectSelector()}
          </div>
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
