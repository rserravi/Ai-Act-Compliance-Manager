import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AISystem } from '../../domain/models';
import type { RiskAssessmentRow } from './Service/risk.service';
import { SystemDetailViewModel } from './SystemDetail.viewmodel';

@customElement('system-detail-page')
export class SystemDetailPage extends LitElement {
  private readonly viewModel = new SystemDetailViewModel();
  private unsubscribe: (() => void) | null = null;

  @property({ type: String, attribute: 'system-id' }) systemId = '';

  @state() private loading = false;
  @state() private system: AISystem | null = null;
  @state() private assessments: RiskAssessmentRow[] = [];

  protected createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.reload();
    this.attachSubscription();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('systemId')) {
      void this.reload();
      this.attachSubscription();
    }
  }

  private attachSubscription() {
    this.unsubscribe?.();
    if (!this.systemId) return;
    this.unsubscribe = this.viewModel.onUpdates(this.systemId, () => {
      void this.reload();
    });
  }

  private async reload() {
    if (!this.systemId) return;
    this.loading = true;
    try {
      const data = await this.viewModel.load(this.systemId);
      this.system = data.system;
      this.assessments = data.assessments;
    } finally {
      this.loading = false;
    }
  }

  private renderAssessments() {
    if (!this.assessments.length) {
      return html`<p class="text-sm text-base-content/70">Sin evaluaciones de riesgo registradas.</p>`;
    }
    return html`
      <div class="overflow-x-auto bg-base-100 shadow rounded-box">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Clasificación</th>
              <th>Justificación</th>
            </tr>
          </thead>
          <tbody>
            ${this.assessments.map((assessment) => html`
              <tr>
                <td>${new Date(assessment.createdAt).toLocaleString()}</td>
                <td class="capitalize">${assessment.classification}</td>
                <td>${assessment.justification}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  protected render() {
    if (this.loading) {
      return html`<div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>`;
    }

    if (!this.system) {
      return html`<p class="text-sm text-base-content/70">No se encontró información del sistema solicitado.</p>`;
    }

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${this.system.name}</h1>
          <p class="text-base-content/70">Identificador: ${this.system.id}</p>
        </header>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">Rol</div>
            <div class="stat-value text-lg capitalize">${this.system.role ?? '—'}</div>
          </div>
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">Riesgo</div>
            <div class="stat-value text-lg capitalize">${this.system.risk ?? '—'}</div>
          </div>
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">Estado documental</div>
            <div class="stat-value text-lg capitalize">${this.system.docStatus ?? '—'}</div>
          </div>
        </div>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold">Evaluaciones de riesgo</h2>
          ${this.renderAssessments()}
        </section>
      </section>
    `;
  }
}
