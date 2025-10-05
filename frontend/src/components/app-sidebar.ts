import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import type { AISystem } from '../domain/models';
import { t } from '../shared/i18n';
import { LocalizedElement } from '../shared/localized-element';
import sharedStyles from '../styles.css?inline';
import {
  auditsIcon,
  dashboardIcon,
  evidencesIcon,
  incidentsIcon,
  projectsIcon,
  settingsIcon,
  teamsIcon
} from '../shared/icons';

const baseStyles = css`
  :host {
    display: contents;
  }
`;

type NavigationItem = {
  labelKey: 'nav.dashboard' | 'nav.projects' | 'nav.incidents' | 'nav.settings';
  href: string;
  icon: () => ReturnType<typeof dashboardIcon>;
};

type ProjectNavigationItem = {
  labelKey: 'nav.project.evidences' | 'nav.project.teams' | 'nav.project.audits';
  getHref: (projectId: string) => string;
  icon: () => ReturnType<typeof dashboardIcon>;
};

const NAVIGATION_ITEMS: ReadonlyArray<NavigationItem> = [
  { labelKey: 'nav.dashboard', href: '/', icon: dashboardIcon },
  { labelKey: 'nav.projects', href: '/projects', icon: projectsIcon },
  { labelKey: 'nav.incidents', href: '/incidents', icon: incidentsIcon },
  { labelKey: 'nav.settings', href: '/settings', icon: settingsIcon }
];

const PROJECT_NAV_ITEMS: ReadonlyArray<ProjectNavigationItem> = [
  {
    labelKey: 'nav.project.evidences',
    getHref: (projectId: string) => `/projects/${projectId}/deliverables`,
    icon: evidencesIcon
  },
  {
    labelKey: 'nav.project.teams',
    getHref: (projectId: string) => `/projects/${projectId}/org`,
    icon: teamsIcon
  },
  {
    labelKey: 'nav.project.audits',
    getHref: (projectId: string) => `/projects/${projectId}/audit`,
    icon: auditsIcon
  }
];

@customElement('app-sidebar')
export class AppSidebar extends LocalizedElement {
  static override styles = [css([sharedStyles] as any), baseStyles];

  @property({ type: Boolean }) mobileMenuOpen = false;
  @property({ attribute: false }) activeProject: AISystem | null = null;
  @property({ attribute: false }) projects: ReadonlyArray<AISystem> = [];
  @property({ attribute: false }) activeProjectId: string | null = null;
  @property({ type: String }) activePath = '/';

  private handleNavigate(event: Event, href: string) {
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent<string>('navigate', { detail: href, bubbles: true, composed: true })
    );
  }

  private handleProjectChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    this.dispatchEvent(
      new CustomEvent<string | null>('project-change', {
        detail: select.value || null,
        bubbles: true,
        composed: true
      })
    );
  }

  private renderNavigation(activeProject: AISystem | null) {
    const activePath = this.activePath;
    return html`
      <nav class="menu px-4 py-6 text-base-content/80">
        ${NAVIGATION_ITEMS.map(
          (item) => html`
            <li>
              <a
                class=${classMap({ 'active font-semibold': activePath === item.href })}
                aria-current=${activePath === item.href ? 'page' : undefined}
                href=${item.href}
                @click=${(event: Event) => this.handleNavigate(event, item.href)}
              >
                <span class="flex items-center gap-3">
                  <span class="text-base-content/60">${item.icon()}</span>
                  <span>${t(item.labelKey)}</span>
                </span>
              </a>
            </li>
          `
        )}
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
                      @click=${(event: Event) => this.handleNavigate(event, href)}
                    >
                      <span class="flex items-center gap-3">
                        <span class="text-base-content/60">${item.icon()}</span>
                        <span>${t(item.labelKey)}</span>
                      </span>
                    </a>
                  </li>`;
              })}
            </nav>
          `
        : null}
    `;
  }

  private renderProjectSelectorMenuItems() {
    const inWizard = this.activePath.startsWith('/projects/new');

    if (!this.projects.length) {
      return html`<span class="text-sm text-base-content/70">${t('app.projectSelector.empty')}</span>`;
    }

    const emptyOptionLabel = this.activeProjectId
      ? t('app.projectSelector.all')
      : t('app.projectSelector.placeholder');

    return html`
      <label class="form-control w-full max-w-xs">
        <span class="label">
          <span class="label-text text-sm font-medium">${t('app.projectSelector.title')}</span>
        </span>
        <select
          class="select select-bordered select-sm"
          @change=${this.handleProjectChange}
          .value=${this.activeProjectId ?? ''}
          ?disabled=${inWizard}
        >
          <option value="">${emptyOptionLabel}</option>
          ${this.projects.map(
            (project) => html`<option value=${project.id} ?selected=${project.id === this.activeProjectId}>
              ${project.name}
            </option>`
          )}
        </select>
        ${inWizard
          ? html`<p class="mt-1 text-xs text-base-content/60">${t(
              'app.projectSelector.wizardDisabled'
            )}</p>`
          : null}
      </label>
    `;
  }

  render() {
    const activeProject = this.activeProject;

    return html`
      <aside
        id="app-main-navigation"
        class="w-72 bg-base-100 border-r border-base-300 flex flex-col fixed inset-y-0 left-0 z-30 transform transition-transform lg:static lg:translate-x-0 ${
          this.mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }"
      >
        <div class="p-6 border-b border-base-300">
          <div class="flex items-center gap-3">
            <img
              class="h-10 w-10"
              src="/assets/favicon-64x64.png"
              alt=${t('app.logoAlt')}
              width="64"
              height="64"
            />
            <div class="leading-tight">
              <p class="text-lg font-semibold text-base-content">${t('app.shortTitle')}</p>
              <p class="text-sm text-base-content/70">${t('app.sidebarSubtitle')}</p>
            </div>
          </div>
        </div>
        <div class="border-b border-base-300 px-6 py-4 space-y-3">
          ${this.renderProjectSelectorMenuItems()}
        </div>
        <div class="flex-1 overflow-y-auto">${this.renderNavigation(activeProject)}</div>
      </aside>
    `;
  }
}
