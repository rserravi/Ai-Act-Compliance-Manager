import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
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
import './app-header';
import './app-sidebar';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '0.1.0';

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

  private handlePendingActions() {
    const scrollToPendingActions = () => {
      const target = document.getElementById('pending-actions');
      if (!target) {
        return false;
      }
      target.scrollIntoView({ behavior: 'smooth' });
      return true;
    };

    const ensureScroll = (remainingAttempts = 40) => {
      if (remainingAttempts <= 0) {
        return;
      }

      if (getCurrentPath() !== '/') {
        window.setTimeout(() => ensureScroll(remainingAttempts - 1), 100);
        return;
      }

      if (!scrollToPendingActions()) {
        window.setTimeout(() => ensureScroll(remainingAttempts - 1), 100);
      }
    };

    if (getCurrentPath() !== '/') {
      navigateTo('/');
    }

    ensureScroll();
  }

  private readonly toggleMenu = () => {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  };

  private handleNavigate(href: string) {
    navigateTo(href);
    this.mobileMenuOpen = false;
    this.syncActivePath();
  }

  private handleProjectChange(projectId: string | null) {
    const currentPath = getCurrentPath();
    const isProjectContextRoute = /^\/projects\/[^/]+(?:\/.*)?$/.test(currentPath);

    this.projects.value.setActiveProjectId(projectId);

    if (!projectId) {
      if (isProjectContextRoute) {
        navigateTo('/projects');
        this.syncActivePath();
      }
      return;
    }

    if (isProjectContextRoute) {
      const segments = currentPath.split('/');
      if (segments.length > 2) {
        segments[2] = projectId;
        const newPath = segments.join('/');

        if (newPath !== currentPath) {
          navigateTo(newPath, { replace: true });
          this.syncActivePath();
        }
      }
    }
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

  private handleLanguageChange(language: SupportedLanguage) {
    if (supportedLanguages.includes(language)) {
      this.language = language;
      changeLanguage(language);
    }
  }

  protected render() {
    const user = this.auth.user;
    const activeProject = this.projects.activeProject;

    return html`
      <div class="min-h-screen flex bg-base-200 text-base-content">
        <app-sidebar
          .mobileMenuOpen=${this.mobileMenuOpen}
          .activeProject=${activeProject}
          .projects=${this.projects.projects}
          .activeProjectId=${this.projects.activeProjectId}
          .activePath=${this.activePath}
          @navigate=${(event: CustomEvent<string>) => this.handleNavigate(event.detail)}
          @project-change=${(event: CustomEvent<string | null>) => this.handleProjectChange(event.detail)}
        ></app-sidebar>

        <div class="flex-1 flex flex-col">
          <app-header
            .activeProject=${activeProject}
            .language=${this.language}
            .supportedLanguages=${supportedLanguages}
            .userFullName=${user?.full_name ?? null}
            .userEmail=${user?.email ?? null}
            @toggle-menu=${this.toggleMenu}
            @language-change=${(event: CustomEvent<SupportedLanguage>) =>
              this.handleLanguageChange(event.detail)}
            @pending-actions=${() => this.handlePendingActions()}
            @logout=${() => this.logout()}
          ></app-header>

          <main class="flex-1 overflow-y-auto p-6">
            <slot></slot>
          </main>

          <footer
            class="bg-base-100 border-t border-base-300 px-6 py-3 text-sm text-base-content/70 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
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
