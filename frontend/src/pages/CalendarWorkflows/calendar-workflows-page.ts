import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getTasksForProject } from './CalendarWorkflows.viewmodel';

@customElement('calendar-workflows-page')
export class CalendarWorkflowsPage extends LitElement {
  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    const projectId = this.projectId || this.projects.activeProjectId;
    const project = projectId ? this.projects.value.getProjectById(projectId) : null;
    const tasks = getTasksForProject(this.projects.value, projectId ?? null);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Calendario y workflows</h1>
          <p class="text-base-content/70">
            Consulta las tareas y hitos planificados para el proyecto ${project?.name ?? 'seleccionado'}.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-2">
          ${tasks.length === 0
            ? html`<p class="text-sm text-base-content/70">No hay tareas registradas para este proyecto.</p>`
            : tasks.map((task) => html`
                <article class="card bg-base-100 shadow">
                  <div class="card-body space-y-2">
                    <h3 class="card-title text-lg">${task.title}</h3>
                    <p class="text-sm text-base-content/70">Asignado a ${task.assignee ?? 'Sin asignar'}</p>
                    <p class="text-sm">Fecha objetivo: ${task.due}</p>
                    <span class="badge badge-outline">${task.status}</span>
                  </div>
                </article>
              `)}
        </div>
      </section>
    `;
  }
}
