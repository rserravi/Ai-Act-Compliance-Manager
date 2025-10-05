import { html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getAuditDocuments, summarizeEvidences, refreshAuditDocuments } from './AuditEvidences.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('audit-evidences-page')
export class AuditEvidencesPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';
  @state() private isLoading = false;
  @state() private loadError: string | null = null;

  #lastLoadedProjectId: string | null = null;
  #loadingFor: string | null = null;

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      Abierto: t('deliverables.status.open'),
      Comenzado: t('deliverables.status.inProgress'),
      'En Revisión': t('deliverables.status.inReview'),
      Terminado: t('deliverables.status.done')
    };
    return map[status] ?? status;
  }

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
    if (!changedProperties.has('projectId')) {
      return;
    }

    const newProjectId = this.projectId?.trim();
    if (newProjectId) {
      if (this.projects.activeProjectId !== newProjectId) {
        this.projects.value.setActiveProjectId(newProjectId);
      }
    } else if (this.projects.activeProjectId !== null) {
      this.projects.value.setActiveProjectId(null);
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#maybeLoadDocuments();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (changedProperties.has('projectId')) {
      void this.#maybeLoadDocuments(true);
      return;
    }
    const resolvedProjectId = this.projectId || this.projects.activeProjectId || null;
    if (resolvedProjectId !== this.#lastLoadedProjectId) {
      void this.#maybeLoadDocuments();
    }
  }

  async #maybeLoadDocuments(force = false): Promise<void> {
    const projectId = this.projectId || this.projects.activeProjectId || '';
    if (!projectId) {
      this.#lastLoadedProjectId = null;
      this.isLoading = false;
      this.loadError = null;
      return;
    }

    if (!force && (this.#lastLoadedProjectId === projectId || this.#loadingFor === projectId)) {
      return;
    }

    this.#lastLoadedProjectId = projectId;
    this.#loadingFor = projectId;
    this.isLoading = true;
    this.loadError = null;

    try {
      const documents = await refreshAuditDocuments(this.projects.value, projectId);
      if (this.#loadingFor !== projectId) {
        return;
      }
      if (documents.length === 0) {
        this.loadError = t('auditEvidences.errors.empty');
      } else {
        this.loadError = null;
      }
    } catch (error) {
      if (this.#loadingFor !== projectId) {
        return;
      }
      const message =
        error instanceof Error ? error.message : t('auditEvidences.errors.loadFailed');
      this.loadError = message;
    } finally {
      if (this.#loadingFor === projectId) {
        this.isLoading = false;
        this.#loadingFor = null;
      }
    }
  }

  protected render() {
    const projectId = this.projectId || this.projects.activeProjectId;
    const project = projectId ? this.projects.value.getProjectById(projectId) : null;
    const documents = getAuditDocuments(this.projects.value, projectId ?? null);
    const summary = summarizeEvidences(documents);
    const showContent = !this.isLoading && !this.loadError;

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('auditEvidences.pageTitle')}</h1>
          <p class="text-base-content/70">
            ${t('auditEvidences.pageSubtitle', { project: project?.name ?? t('common.notAvailable') })}
          </p>
        </header>

        ${this.loadError
          ? html`<div class="alert alert-error"><span>${this.loadError}</span></div>`
          : null}

        ${this.isLoading
          ? html`<progress class="progress progress-primary w-full"></progress>`
          : null}

        ${showContent
          ? html`
              <div class="stats shadow bg-base-100">
                <div class="stat">
                  <div class="stat-title">${t('auditEvidences.summary.totalDocuments')}</div>
                  <div class="stat-value">${summary.total}</div>
                  <div class="stat-desc">${t('auditEvidences.summary.description')}</div>
                </div>
                ${Object.entries(summary.byStatus).map(
                  ([status, count]) => html`
                    <div class="stat">
                      <div class="stat-title capitalize">${this.translateStatus(status)}</div>
                      <div class="stat-value text-lg">${count}</div>
                    </div>
                  `
                )}
              </div>

              <div class="overflow-x-auto bg-base-100 shadow rounded-box">
                <table class="table">
                  <thead>
                    <tr>
                      <th>${t('auditEvidences.table.columns.name')}</th>
                      <th>${t('auditEvidences.table.columns.status')}</th>
                      <th>${t('auditEvidences.table.columns.updated')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${documents.map(
                      (doc) => html`
                        <tr>
                          <td class="font-medium">${doc.name}</td>
                          <td>${this.translateStatus(doc.status)}</td>
                          <td>
                            ${doc.updatedAt
                              ? new Date(doc.updatedAt).toLocaleDateString(this.currentLanguage)
                              : t('common.notAvailable')}
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}
      </section>
    `;
  }
}
