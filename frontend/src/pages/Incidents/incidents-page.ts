import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IncidentRow } from './Service/incidents.service';
import { IncidentsViewModel } from './Incidents.viewmodel';
import { ProjectController } from '../../state/controllers';

@customElement('incidents-page')
export class IncidentsPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly viewModel = new IncidentsViewModel();
  private readonly projects = new ProjectController(this);
  private unsubscribe: (() => void) | null = null;

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  @state() private incidents: IncidentRow[] = [];
  @state() private loading = false;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.reload();
    this.unsubscribe = this.viewModel.onUpdates(() => {
      void this.reload();
    });
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('projectId')) {
      this.requestUpdate();
    }
  }

  private async reload() {
    this.loading = true;
    try {
      this.incidents = await this.viewModel.load();
    } finally {
      this.loading = false;
    }
  }

  private get filteredIncidents() {
    const projectId = this.projectId || this.projects.activeProjectId;
    if (!projectId) return this.incidents;
    const project = this.projects.value.getProjectById(projectId);
    if (!project) return [];
    return this.incidents.filter((incident) => incident.system === project.name);
  }

  protected render() {
    if (this.loading) {
      return html`<div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>`;
    }

    const items = this.filteredIncidents;

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Incidentes</h1>
          <p class="text-base-content/70">Seguimiento de incidencias reportadas y su estado de revisión.</p>
        </header>

        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sistema</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Título</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((incident) => html`
                <tr>
                  <td>${new Date(incident.date).toLocaleString()}</td>
                  <td>${incident.system}</td>
                  <td class="capitalize">${incident.severity}</td>
                  <td class="capitalize">${incident.status}</td>
                  <td>${incident.title}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        ${items.length === 0
          ? html`<p class="text-sm text-base-content/70">No hay incidentes registrados para este contexto.</p>`
          : null}
      </section>
    `;
  }
}
