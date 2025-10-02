import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { navigateTo } from '../../navigation';
import type { ProjectFilter } from './Model';
import {
  DOC_FILTER_VALUES,
  filterProjects,
  getProjectStateLabel,
  RISK_FILTER_VALUES,
  ROLE_FILTER_VALUES,
  type ProjectRow
} from './Projects.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('projects-page')
export class ProjectsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projectsStore = new ProjectController(this);

  @state() private filter: ProjectFilter = {};

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private updateFilter(field: keyof ProjectFilter, value: string) {
    this.filter = { ...this.filter, [field]: value || undefined };
  }

  private handleSearch(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.updateFilter('q', input.value);
  }

  private goToWizard() {
    navigateTo('/projects/new');
  }

  private openProject(project: ProjectRow) {
    this.projectsStore.value.setActiveProjectId(project.id);
    navigateTo(`/projects/${project.id}/deliverables`);
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
            this.updateFilter(field, select.value);
          }}
        >
          ${values.map((value) => html`<option value=${value}>${formatOption(value)}</option>`)}
        </select>
      </label>
    `;
  }

  private renderTable() {
    const rows = filterProjects(this.projectsStore.projects, this.filter);

    return html`
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
            ${rows.map((row) => html`
              <tr>
                <td class="font-medium">${row.name}</td>
                <td class="capitalize">
                  ${row.role ? t(`roles.${row.role}` as const) : t('common.notAvailable')}
                </td>
                <td class="capitalize">
                  ${row.risk ? t(`riskLevels.${row.risk}` as const) : t('common.notAvailable')}
                </td>
                <td class="capitalize">
                  ${row.docStatus ? t(`docStatus.${row.docStatus}` as const) : t('common.notAvailable')}
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
      </section>
    `;
  }
}
