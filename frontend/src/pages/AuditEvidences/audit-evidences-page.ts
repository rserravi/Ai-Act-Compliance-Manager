import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getAuditDocuments, summarizeEvidences } from './AuditEvidences.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('audit-evidences-page')
export class AuditEvidencesPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

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

  protected render() {
    const projectId = this.projectId || this.projects.activeProjectId;
    const project = projectId ? this.projects.value.getProjectById(projectId) : null;
    const documents = getAuditDocuments(this.projects.value, projectId ?? null);
    const summary = summarizeEvidences(documents);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('auditEvidences.pageTitle')}</h1>
          <p class="text-base-content/70">
            ${t('auditEvidences.pageSubtitle', { project: project?.name ?? t('common.notAvailable') })}
          </p>
        </header>

        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-title">${t('auditEvidences.summary.totalDocuments')}</div>
            <div class="stat-value">${summary.total}</div>
            <div class="stat-desc">${t('auditEvidences.summary.description')}</div>
          </div>
          ${Object.entries(summary.byStatus).map(([status, count]) => html`
            <div class="stat">
              <div class="stat-title capitalize">${this.translateStatus(status)}</div>
              <div class="stat-value text-lg">${count}</div>
            </div>
          `)}
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
              ${documents.map((doc) => html`
                <tr>
                  <td class="font-medium">${doc.name}</td>
                  <td>${this.translateStatus(doc.status)}</td>
                  <td>
                    ${doc.updatedAt
                      ? new Date(doc.updatedAt).toLocaleDateString(this.currentLanguage)
                      : t('common.notAvailable')}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}
