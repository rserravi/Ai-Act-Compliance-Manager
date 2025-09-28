import { html, LitElement } from 'lit';
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

@customElement('projects-page')
export class ProjectsPage extends LitElement {
  private readonly projectsStore = new ProjectController(this);

  @state() private filter: ProjectFilter = {};

  protected createRenderRoot() {
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
    field: keyof ProjectFilter
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
          ${values.map((value) =>
            html`<option value=${value}>${value || 'Todos'}</option>`
          )}
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
              <th>Nombre</th>
              <th>Rol</th>
              <th>Riesgo</th>
              <th>Documentación</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => html`
              <tr>
                <td class="font-medium">${row.name}</td>
                <td class="capitalize">${row.role ?? '—'}</td>
                <td class="capitalize">${row.risk ?? '—'}</td>
                <td class="capitalize">${row.docStatus ?? '—'}</td>
                <td>${getProjectStateLabel(row.projectState)}</td>
                <td>
                  <button class="btn btn-sm" @click=${() => this.openProject(row)}>Ver detalles</button>
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
            <h1 class="text-3xl font-bold">Proyectos</h1>
            <p class="text-base-content/70">Gestiona los sistemas de IA y su documentación asociada.</p>
          </div>
          <button class="btn btn-primary" @click=${this.goToWizard}>Nuevo proyecto</button>
        </header>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          ${this.renderFilterSelect('Rol', ROLE_FILTER_VALUES, 'role')}
          ${this.renderFilterSelect('Riesgo', RISK_FILTER_VALUES, 'risk')}
          ${this.renderFilterSelect('Documentación', DOC_FILTER_VALUES, 'doc')}
          <label class="form-control w-full max-w-xs md:col-span-2 lg:col-span-1">
            <span class="label"><span class="label-text">Buscar</span></span>
            <input
              class="input input-bordered input-sm"
              type="search"
              placeholder="Nombre del proyecto"
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
