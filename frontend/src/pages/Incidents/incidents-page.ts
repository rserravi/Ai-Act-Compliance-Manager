import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IncidentRow } from './Service/incidents.service';
import { IncidentsViewModel } from './Incidents.viewmodel';
import { ProjectController } from '../../state/controllers';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('incidents-page')
export class IncidentsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly viewModel = new IncidentsViewModel();
  private readonly projects = new ProjectController(this);
  private unsubscribe: (() => void) | null = null;

  private translateSeverity(severity: IncidentRow['severity']): string {
    return t(`incident.severity.${severity}` as const);
  }

  private translateStatus(status: IncidentRow['status']): string {
    return t(`incident.status.${status}` as const);
  }

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
          <h1 class="text-3xl font-bold">${t('incidents.pageTitle')}</h1>
          <p class="text-base-content/70">${t('incidents.pageSubtitle')}</p>
        </header>

        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>${t('incidents.columns.date')}</th>
                <th>${t('incidents.columns.system')}</th>
                <th>${t('incidents.columns.severity')}</th>
                <th>${t('incidents.columns.status')}</th>
                <th>${t('incidents.columns.title')}</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0
                ? html`<tr>
                    <td colspan="5" class="text-center text-sm text-base-content/60">
                      ${t('incidents.empty')}
                    </td>
                  </tr>`
                : items.map((incident) => html`
                    <tr>
                      <td>${new Date(incident.date).toLocaleString(this.currentLanguage)}</td>
                      <td>${incident.system}</td>
                      <td class="capitalize">${this.translateSeverity(incident.severity)}</td>
                      <td class="capitalize">${this.translateStatus(incident.status)}</td>
                      <td>${incident.title}</td>
                    </tr>
                  `)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}
