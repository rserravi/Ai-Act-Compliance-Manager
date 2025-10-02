import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AISystem } from '../../domain/models';
import type { RiskAssessmentRow } from './Service/risk.service';
import { SystemDetailViewModel } from './SystemDetail.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('system-detail-page')
export class SystemDetailPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly viewModel = new SystemDetailViewModel();
  private unsubscribe: (() => void) | null = null;

  private translateRole(role: AISystem['role'] | undefined): string {
    return role ? t(`roles.${role}` as const) : t('common.notAvailable');
  }

  private translateRisk(risk: AISystem['risk'] | undefined): string {
    return risk ? t(`riskLevels.${risk}` as const) : t('common.notAvailable');
  }

  private translateDocStatus(status: AISystem['docStatus'] | undefined): string {
    return status ? t(`docStatus.${status}` as const) : t('common.notAvailable');
  }

  private translateClassification(classification: RiskAssessmentRow['classification']): string {
    return t(`riskLevels.${classification}` as const);
  }

  @property({ type: String, attribute: 'system-id' }) systemId = '';

  @state() private loading = false;
  @state() private system: AISystem | null = null;
  @state() private assessments: RiskAssessmentRow[] = [];

  protected createRenderRoot(): HTMLElement {
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
      return html`<p class="text-sm text-base-content/70">${t('systemDetail.assessments.empty')}</p>`;
    }
    return html`
      <div class="overflow-x-auto bg-base-100 shadow rounded-box">
        <table class="table">
          <thead>
            <tr>
              <th>${t('systemDetail.assessments.columns.date')}</th>
              <th>${t('systemDetail.assessments.columns.classification')}</th>
              <th>${t('systemDetail.assessments.columns.justification')}</th>
            </tr>
          </thead>
          <tbody>
            ${this.assessments.map((assessment) => html`
              <tr>
                <td>${new Date(assessment.createdAt).toLocaleString(this.currentLanguage)}</td>
                <td class="capitalize">${this.translateClassification(assessment.classification)}</td>
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
      return html`<p class="text-sm text-base-content/70">${t('systemDetail.notFound')}</p>`;
    }

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${this.system.name}</h1>
          <p class="text-base-content/70">${t('systemDetail.identifier', { id: this.system.id })}</p>
        </header>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">${t('systemDetail.stats.role')}</div>
            <div class="stat-value text-lg capitalize">${this.translateRole(this.system.role)}</div>
          </div>
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">${t('systemDetail.stats.risk')}</div>
            <div class="stat-value text-lg capitalize">${this.translateRisk(this.system.risk)}</div>
          </div>
          <div class="stat bg-base-100 shadow">
            <div class="stat-title">${t('systemDetail.stats.docStatus')}</div>
            <div class="stat-value text-lg capitalize">${this.translateDocStatus(this.system.docStatus)}</div>
          </div>
        </div>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold">${t('systemDetail.assessments.title')}</h2>
          ${this.renderAssessments()}
        </section>
      </section>
    `;
  }
}
