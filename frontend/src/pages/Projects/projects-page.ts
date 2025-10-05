import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { navigateTo } from '../../navigation';
import type { ProjectFilter } from './Model';
import {
  DOC_FILTER_VALUES,
  getProjectStateLabel,
  mapProjectsToRows,
  RISK_FILTER_VALUES,
  ROLE_FILTER_VALUES,
  type ProjectRow
} from './Projects.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import { fetchProjects } from './Service/projects.service';

@customElement('projects-page')
export class ProjectsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projectsStore = new ProjectController(this);

  @state() private filter: ProjectFilter = {};
  @state() private page = 1;
  @state() private pageSize = 10;
  @state() private totalProjects = 0;
  @state() private isLoading = false;
  @state() private rows: ProjectRow[] = [];

  private refreshTimeout?: number;
  private requestToken = 0;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private updateFilter(field: keyof ProjectFilter, value: string) {
    this.filter = { ...this.filter, [field]: value || undefined };
  }

  private handleSearch(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.updateFilter('q', input.value);
    this.page = 1;
    this.scheduleRefresh(300);
  }

  private goToWizard() {
    navigateTo('/projects/new');
  }

  private openProject(project: ProjectRow) {
    this.projectsStore.value.setActiveProjectId(project.id);
    navigateTo(`/projects/${project.id}/deliverables`);
  }

  private scheduleRefresh(delay = 0) {
    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }

    if (delay > 0) {
      this.refreshTimeout = window.setTimeout(() => {
        this.refreshTimeout = undefined;
        void this.refreshProjects();
      }, delay);
      return;
    }

    void this.refreshProjects();
  }

  private async refreshProjects() {
    this.isLoading = true;
    const currentRequest = ++this.requestToken;

    try {
      const result = await fetchProjects({
        filter: this.filter,
        page: this.page,
        pageSize: this.pageSize
      });

      if (currentRequest !== this.requestToken) {
        return;
      }

      this.page = result.page;
      this.pageSize = result.pageSize;
      this.totalProjects = result.total;
      this.rows = mapProjectsToRows(result.items);
      this.projectsStore.value.replaceProjects(result.items);
    } catch (error) {
      if (currentRequest !== this.requestToken) {
        return;
      }
      console.error('Failed to load projects', error);
      this.rows = [];
      this.totalProjects = 0;
    } finally {
      if (currentRequest === this.requestToken) {
        this.isLoading = false;
      }
    }
  }

  protected firstUpdated(): void {
    this.scheduleRefresh();
  }

  private handleFilterChange(field: keyof ProjectFilter, value: string) {
    this.updateFilter(field, value);
    this.page = 1;
    this.scheduleRefresh();
  }

  private renderFilterSelect(
    label: string,
    values: readonly string[],
    field: keyof ProjectFilter,
    formatOption: (value: string) => string
  ) {
    return html`
      <label class="form-control w-full max-w-xs">
        <span class="label"><span class="label-text">${label}</span></span>
        <select
          class="select select-bordered select-sm"
          .value=${this.filter[field] ?? ''}
          @change=${(event: Event) => {
            const select = event.currentTarget as HTMLSelectElement;
            this.handleFilterChange(field, select.value);
          }}
        >
          ${values.map((value) => html`<option value=${value}>${formatOption(value)}</option>`)}
        </select>
      </label>
    `;
  }

  private get totalPages(): number {
    if (this.totalProjects === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalProjects / this.pageSize));
  }

  private changePage(delta: number) {
    const nextPage = Math.min(Math.max(this.page + delta, 1), this.totalPages);
    if (nextPage !== this.page) {
      this.page = nextPage;
      this.scheduleRefresh();
    }
  }

  private renderTable() {
    if (!this.rows.length) {
      if (this.isLoading) {
        return html`
          <div class="flex justify-center py-12">
            <span class="loading loading-spinner text-primary"></span>
          </div>
        `;
      }

      return html`
        <div class="alert alert-info shadow">
          <span>${t('projects.emptyState')}</span>
        </div>
      `;
    }

    return html`
      <div class="relative">
        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>${t('projects.columns.name')}</th>
                <th>${t('projects.columns.role')}</th>
                <th>${t('projects.columns.risk')}</th>
                <th>${t('projects.columns.docStatus')}</th>
                <th>${t('projects.columns.state')}</th>
                <th>${t('projects.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${this.rows.map((row) => html`
                <tr>
                  <td class="font-medium">${row.name}</td>
                  <td class="capitalize">
                    ${row.role ? t(`roles.${row.role}` as const) : t('common.notAvailable')}
                  </td>
                  <td class="capitalize">
                    ${row.risk ? t(`riskLevels.${row.risk}` as const) : t('common.notAvailable')}
                  </td>
                  <td class="capitalize">
                    ${row.docStatus
                      ? t(`docStatus.${row.docStatus}` as const)
                      : t('common.notAvailable')}
                  </td>
                  <td>${getProjectStateLabel(row.projectState)}</td>
                  <td>
                    <button class="btn btn-sm" @click=${() => this.openProject(row)}>
                      ${t('common.view')}
                    </button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
        ${this.isLoading
          ? html`
              <div
                class="absolute inset-0 flex items-center justify-center rounded-box bg-base-100/80"
              >
                <span class="loading loading-spinner text-primary"></span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private renderPagination() {
    if (this.totalProjects === 0) {
      return nothing;
    }

    const totalPages = this.totalPages;
    const hasRows = this.rows.length > 0;
    const from = hasRows ? (this.page - 1) * this.pageSize + 1 : 0;
    const to = hasRows ? Math.min(this.totalProjects, from + this.rows.length - 1) : 0;

    return html`
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        aria-live="polite"
      >
        <span class="text-sm text-base-content/70">
          ${t('common.pagination.range', { from, to, total: this.totalProjects })}
        </span>
        <div class="join">
          <button
            class="join-item btn btn-sm"
            ?disabled=${this.page <= 1}
            @click=${() => this.changePage(-1)}
          >
            ${t('common.pagination.previous')}
          </button>
          <span class="join-item btn btn-ghost btn-sm pointer-events-none">
            ${t('common.pagination.pageStatus', { page: this.page, total: totalPages })}
          </span>
          <button
            class="join-item btn btn-sm"
            ?disabled=${this.page >= totalPages}
            @click=${() => this.changePage(1)}
          >
            ${t('common.pagination.next')}
          </button>
        </div>
      </div>
    `;
  }

  protected render() {
    return html`
      <section class="space-y-6">
        <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">${t('projects.pageTitle')}</h1>
            <p class="text-base-content/70">${t('projects.pageSubtitle')}</p>
          </div>
          <button class="btn btn-primary" @click=${this.goToWizard}>
            ${t('projects.actions.newProject')}
          </button>
        </header>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          ${this.renderFilterSelect(
            t('projects.filters.role.label'),
            ROLE_FILTER_VALUES,
            'role',
            (value) =>
              value ? t(`roles.${value}` as const) : t('projects.filters.role.all')
          )}
          ${this.renderFilterSelect(
            t('projects.filters.risk.label'),
            RISK_FILTER_VALUES,
            'risk',
            (value) =>
              value ? t(`riskLevels.${value}` as const) : t('projects.filters.risk.all')
          )}
          ${this.renderFilterSelect(
            t('projects.filters.doc.label'),
            DOC_FILTER_VALUES,
            'doc',
            (value) =>
              value ? t(`docStatus.${value}` as const) : t('projects.filters.doc.all')
          )}
          <label class="form-control w-full max-w-xs md:col-span-2 lg:col-span-1">
            <span class="label"><span class="label-text">${t('projects.filters.search.label')}</span></span>
            <input
              class="input input-bordered input-sm"
              type="search"
              placeholder=${t('projects.filters.search.placeholder')}
              .value=${this.filter.q ?? ''}
              @input=${this.handleSearch}
            >
          </label>
        </div>

        ${this.renderTable()}
        ${this.renderPagination()}
      </section>
    `;
  }
}
