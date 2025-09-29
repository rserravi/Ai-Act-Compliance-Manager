import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getAuditDocuments, summarizeEvidences } from './AuditEvidences.viewmodel';

@customElement('audit-evidences-page')
export class AuditEvidencesPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected render() {
    const projectId = this.projectId || this.projects.activeProjectId;
    const project = projectId ? this.projects.value.getProjectById(projectId) : null;
    const documents = getAuditDocuments(this.projects.value, projectId ?? null);
    const summary = summarizeEvidences(documents);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Evidencias de auditoría</h1>
          <p class="text-base-content/70">
            Estado de la documentación preparada para auditorías de cumplimiento del proyecto ${project?.name ?? 'actual'}.
          </p>
        </header>

        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-title">Documentos</div>
            <div class="stat-value">${summary.total}</div>
            <div class="stat-desc">Registros disponibles</div>
          </div>
          ${Object.entries(summary.byStatus).map(([status, count]) => html`
            <div class="stat">
              <div class="stat-title capitalize">${status}</div>
              <div class="stat-value text-lg">${count}</div>
            </div>
          `)}
        </div>

        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Última actualización</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map((doc) => html`
                <tr>
                  <td class="font-medium">${doc.name}</td>
                  <td>${doc.status}</td>
                  <td>${doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '—'}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}
