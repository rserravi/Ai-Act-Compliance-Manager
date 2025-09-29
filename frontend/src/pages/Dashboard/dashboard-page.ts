import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createDashboardViewModel,
  DOC_STATUS_ORDER,
  type PendingAction,
  type TimelineEvent
} from './Dashboard.viewmodel';

const STATUS_COLOR_MAP: Record<string, string> = {
  vigente: 'var(--su)',
  borrador: 'var(--wa)',
  obsoleta: 'var(--er)',
  na: 'var(--bc)'
};

@customElement('dashboard-page')
export class DashboardPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly model = createDashboardViewModel();

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private renderKpis() {
    const { kpis } = this.model;
    return html`
      <div class="grid gap-4 md:grid-cols-4">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <span class="text-xs uppercase text-base-content/60">Documentación vigente</span>
            <span class="text-3xl font-semibold">${kpis.docVigentePct}%</span>
            <progress class="progress progress-primary" value=${kpis.docVigentePct} max="100"></progress>
          </div>
        </div>
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <span class="text-xs uppercase text-base-content/60">Sistemas de alto riesgo</span>
            <span class="text-3xl font-semibold">${kpis.highRisk}</span>
          </div>
        </div>
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <span class="text-xs uppercase text-base-content/60">Total de sistemas</span>
            <span class="text-3xl font-semibold">${kpis.totalSystems}</span>
          </div>
        </div>
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <span class="text-xs uppercase text-base-content/60">Tareas para hoy</span>
            <span class="text-3xl font-semibold">${kpis.tasksToday}</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderCompliance() {
    const entries = this.model.complianceByBusinessUnit;
    return html`
      <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">Cumplimiento por unidad</h2>
            <p class="text-sm text-base-content/60">Distribución de estados documentales por unidad de negocio.</p>
          </header>
          <div class="flex flex-wrap gap-2">
            ${DOC_STATUS_ORDER.map(
              (status) => html`<span class="badge badge-neutral badge-outline capitalize">${status}</span>`
            )}
          </div>
          ${entries.length === 0
            ? html`<p class="text-sm text-base-content/60">No hay datos disponibles.</p>`
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
                          <span class="text-xs text-base-content/60">${entry.total} sistemas</span>
                        </div>
                        <div class="w-full h-3 rounded bg-base-200 overflow-hidden flex">
                          ${segments.length
                            ? segments.map(
                                (segment) => html`<div
                                  class="h-full"
                                  style="width:${segment.percent}%; background-color:${
                                    STATUS_COLOR_MAP[segment.status as string] ?? 'var(--bc)'
                                  }"
                                  title=${`${segment.status}: ${segment.count}`}
                                ></div>`
                              )
                            : html`<div class="flex-1 bg-base-300"></div>`}
                        </div>
                        <div class="flex flex-wrap gap-2 text-xs">
                          ${segments.map(
                            (segment) => html`<span class="badge badge-ghost capitalize">
                              ${segment.status} · ${segment.count}
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
    return html`
      <li class="border-l border-base-300 pl-4 relative">
        <span class="w-3 h-3 rounded-full bg-primary absolute -left-1 top-1"></span>
        <div class="flex items-center justify-between">
          <h4 class="font-semibold">${event.type}</h4>
          <span class="text-xs text-base-content/60">
            ${date.toLocaleDateString()} · ${date.toLocaleTimeString()}
          </span>
        </div>
        <p class="text-sm text-base-content/70">
          ${Object.entries(event.metadata ?? {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(' · ')}
        </p>
      </li>
    `;
  }

  private renderTimeline() {
    return html`
      <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">Actividad reciente</h2>
            <p class="text-sm text-base-content/60">Eventos de seguimiento y documentación más recientes.</p>
          </header>
          <ol class="space-y-4">
            ${repeat(this.model.timeline, (item) => item.id, (item) => this.renderTimelineItem(item))}
          </ol>
        </div>
      </div>
    `;
  }

  private renderPendingActions() {
    const items = this.model.pendingActions;
    return html`
      <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
          <header>
            <h2 class="card-title">Acciones pendientes</h2>
            <p class="text-sm text-base-content/60">Tareas en curso asociadas a sistemas y proyectos.</p>
          </header>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Sistema</th>
                  <th>Responsable</th>
                  <th>Fecha límite</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((action: PendingAction) => html`
                  <tr>
                    <td class="font-medium">${action.systemName}</td>
                    <td>${action.owner}</td>
                    <td>${action.due}</td>
                    <td><span class="badge badge-outline capitalize">${action.priority}</span></td>
                    <td><span class="badge badge-neutral capitalize">${action.status}</span></td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Panel de control</h1>
          <p class="text-base-content/70">Resumen de indicadores de cumplimiento y actividad reciente.</p>
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
