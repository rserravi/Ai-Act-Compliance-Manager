import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createDashboardViewModel,
  DOC_STATUS_ORDER,
  type PendingAction,
  type TimelineEvent
} from './Dashboard.viewmodel';
import styles from '../../styles.css?inline';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import { evidencesIcon, incidentsIcon, projectsIcon, tasksIcon } from '../../shared/icons';

const STATUS_COLOR_MAP: Record<string, string> = {
  vigente: 'var(--su)',
  borrador: 'var(--wa)',
  obsoleta: 'var(--er)',
  na: 'var(--bc)'
};

@customElement('dashboard-page')
export class DashboardPage extends LocalizedElement {
  static styles = [css([styles] as any)];
  declare renderRoot: HTMLElement;

  private readonly model = createDashboardViewModel();

  private formatDateTime(date: Date): string {
    return `${date.toLocaleDateString(this.currentLanguage)} · ${date.toLocaleTimeString(this.currentLanguage, {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  private getTimelineContext(event: TimelineEvent): Record<string, unknown> {
    const metadata = event.metadata ?? {};
    switch (event.type) {
      case 'riskAssessment':
        return {
          system: metadata.system ?? '',
          risk: metadata.classification ? t(`riskLevels.${metadata.classification as string}`) : ''
        };
      case 'incidentClosed':
        return {
          system: metadata.system ?? '',
          incident: metadata.incident ?? '',
          owner: metadata.owner ?? ''
        };
      case 'documentUpdated':
        return {
          system: metadata.system ?? '',
          document: metadata.document ?? ''
        };
      case 'taskCreated': {
        const system = metadata.system ?? '';
        const taskKey = metadata.taskKey as string | undefined;
        const task = taskKey ? t(taskKey, { system }) : metadata.task ?? '';
        return {
          system,
          task
        };
      }
      default:
        return metadata;
    }
  }

  private renderKpis() {
    const { kpis } = this.model;
    const metrics = [
      {
        label: t('dashboard.metrics.registeredProjects'),
        value: kpis.registeredSystems,
        subtitle: t('dashboard.metrics.registeredProjectsSubtitle'),
        icon: projectsIcon()
      },
      {
        label: t('dashboard.metrics.highRiskProjects'),
        value: kpis.highRiskSystems,
        subtitle: t('dashboard.metrics.highRiskProjectsSubtitle'),
        icon: incidentsIcon()
      },
      {
        label: t('dashboard.metrics.pendingEvidences'),
        value: kpis.pendingEvidencesThisWeek,
        subtitle: t('dashboard.metrics.pendingEvidencesSubtitle'),
        icon: evidencesIcon()
      },
      {
        label: t('dashboard.metrics.pendingTasks'),
        value: kpis.tasksToday,
        subtitle: t('dashboard.metrics.pendingTasksSubtitle'),
        icon: tasksIcon()
      }
    ];

    return html`
      <div class="grid gap-4 md:grid-cols-4">
        ${metrics.map(
          (metric) => html`
            <div class="card bg-base-100 shadow">
              <div class="card-body space-y-4">
                <div class="flex items-start justify-between gap-4">
                  <span class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    ${metric.label}
                  </span>
                  <span class="rounded-full bg-primary/10 p-2 text-primary">${metric.icon}</span>
                </div>
                <span class="text-3xl font-semibold text-base-content">${metric.value}</span>
                <span class="text-sm text-secondary">${metric.subtitle}</span>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private renderCompliance() {
    const entries = this.model.complianceByBusinessUnit;
    return html`
      <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">${t('dashboard.compliance.title')}</h2>
            <p class="text-sm text-base-content/60">${t('dashboard.compliance.subtitle')}</p>
          </header>
          <div class="flex flex-wrap gap-2">
            ${DOC_STATUS_ORDER.map(
              (status) => html`<span class="badge badge-neutral badge-outline capitalize">
                ${t(`docStatus.${status}`)}
              </span>`
            )}
          </div>
          ${entries.length === 0
            ? html`<p class="text-sm text-base-content/60">${t('dashboard.compliance.units.noData')}</p>`
            : html`
                <div class="space-y-4">
                  ${entries.map((entry) => {
                    const segments = DOC_STATUS_ORDER.map((status) => {
                      const count = entry.totals[status as keyof typeof entry.totals] ?? 0;
                      const percent = entry.total ? Math.round((count / entry.total) * 100) : 0;
                      return { status, count, percent };
                    }).filter((segment) => segment.count > 0);
                    return html`
                      <article class="space-y-2" aria-label=${`Indicadores para ${entry.businessUnit}`}>
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold">${entry.businessUnit}</h3>
                          <span class="text-xs text-base-content/60">
                            ${entry.total === 1
                              ? t('dashboard.compliance.totalLabel_one', { count: entry.total })
                              : t('dashboard.compliance.totalLabel_other', { count: entry.total })}
                          </span>
                        </div>
                        <div class="w-full h-3 rounded bg-base-200 overflow-hidden flex">
                          ${segments.length
                            ? segments.map(
                                (segment) => html`<div
                                  class="h-full"
                                  style="width:${segment.percent}%; background-color:${
                                    STATUS_COLOR_MAP[segment.status as string] ?? 'var(--bc)'
                                  }"
                                  title=${`${t(`docStatus.${segment.status}`)}: ${segment.count}`}
                                ></div>`
                              )
                            : html`<div class="flex-1 bg-base-300"></div>`}
                        </div>
                        <div class="flex flex-wrap gap-2 text-xs">
                          ${segments.map(
                            (segment) => html`<span class="badge badge-ghost capitalize">
                              ${t(`docStatus.${segment.status}`)} · ${segment.count}
                            </span>`
                          )}
                        </div>
                      </article>
                    `;
                  })}
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderTimelineItem(event: TimelineEvent) {
    const date = new Date(event.date);
    const typeKey = `dashboard.timeline.items.${event.type}` as const;
    const typeLabel = t(`dashboard.timeline.types.${event.type}` as const);
    const context = this.getTimelineContext(event);
    return html`
      <li class="border-l border-base-300 pl-4 relative">
        <span class="w-3 h-3 rounded-full bg-primary absolute -left-1 top-1"></span>
        <div class="flex items-center justify-between">
          <h4 class="font-semibold">${t(`${typeKey}.title` as const)}</h4>
          <span class="text-xs text-base-content/60">
            ${this.formatDateTime(date)} · ${typeLabel}
          </span>
        </div>
        <p class="text-sm text-base-content/70">${t(`${typeKey}.description` as const, context)}</p>
      </li>
    `;
  }

  private renderTimeline() {
    const events = this.model.timeline;
    return html`
      <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">${t('dashboard.timeline.title')}</h2>
            <p class="text-sm text-base-content/60">${t('dashboard.timeline.subtitle')}</p>
          </header>
          ${events.length === 0
            ? html`<p class="text-sm text-base-content/60">${t('dashboard.timeline.empty')}</p>`
            : html`
                <ol class="space-y-4">
                  ${repeat(events, (item) => item.id, (item) => this.renderTimelineItem(item))}
                </ol>
              `}
        </div>
      </div>
    `;
  }

  private renderPendingActions() {
    const items = this.model.pendingActions;
    return html`
      <section id="pending-actions" class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">${t('dashboard.actions.title')}</h2>
            <p class="text-sm text-base-content/60">${t('dashboard.actions.subtitle')}</p>
          </header>
          ${items.length === 0
            ? html`<p class="text-sm text-base-content/60">${t('dashboard.actions.empty')}</p>`
            : html`
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>${t('dashboard.actions.columns.task')}</th>
                        <th>${t('dashboard.actions.columns.system')}</th>
                        <th>${t('dashboard.actions.columns.owner')}</th>
                        <th>${t('dashboard.actions.columns.due')}</th>
                        <th>${t('dashboard.actions.columns.priority')}</th>
                        <th>${t('dashboard.actions.columns.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.map((action: PendingAction) => {
                        const dueDate = new Date(action.due);
                        return html`
                          <tr>
                            <td class="font-medium">${t(action.titleKey, { system: action.systemName })}</td>
                            <td>${action.systemName}</td>
                            <td>${action.owner}</td>
                            <td>${dueDate.toLocaleDateString(this.currentLanguage)}</td>
                            <td>
                              <span class="badge badge-outline capitalize">
                                ${t(`dashboard.actions.priority.${action.priority}` as const)}
                              </span>
                            </td>
                            <td>
                              <span class="badge badge-neutral capitalize">
                                ${t(`dashboard.actions.status.${action.status}` as const)}
                              </span>
                            </td>
                          </tr>
                        `;
                      })}
                    </tbody>
                  </table>
                </div>
              `}
        </div>
      </section>
    `;
  }

  protected render() {
    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('dashboard.pageTitle')}</h1>
          <p class="text-base-content/70">${t('dashboard.pageSubtitle')}</p>
        </header>
        ${this.renderKpis()}
        <div class="grid gap-6 lg:grid-cols-2">
          ${this.renderCompliance()}
          ${this.renderTimeline()}
        </div>
        ${this.renderPendingActions()}
      </section>
    `;
  }
}
