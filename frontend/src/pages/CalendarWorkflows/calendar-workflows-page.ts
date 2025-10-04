import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getTasksForProject } from './CalendarWorkflows.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('calendar-workflows-page')
export class CalendarWorkflowsPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
    if (!changedProperties.has('projectId')) {
      return;
    }

    const newProjectId = this.projectId?.trim();
    if (newProjectId) {
      if (this.projects.activeProjectId !== newProjectId) {
        this.projects.value.setActiveProjectId(newProjectId);
      }
    } else if (this.projects.activeProjectId !== null) {
      this.projects.value.setActiveProjectId(null);
    }
  }

  protected render() {
    const projectId = this.projectId || this.projects.activeProjectId;
    const project = projectId ? this.projects.value.getProjectById(projectId) : null;
    const tasks = getTasksForProject(this.projects.value, projectId ?? null);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('calendarWorkflows.title')}</h1>
          <p class="text-base-content/70">
            ${t('calendarWorkflows.subtitle', { project: project?.name ?? t('common.notAvailable') })}
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-2">
          ${tasks.length === 0
            ? html`<p class="text-sm text-base-content/70">${t('calendarWorkflows.empty')}</p>`
            : tasks.map((task) => html`
                <article class="card bg-base-100 shadow">
                  <div class="card-body space-y-2">
                    <h3 class="card-title text-lg">${task.title}</h3>
                    <p class="text-sm text-base-content/70">
                      ${t('calendarWorkflows.task.assignee', {
                        assignee: task.assignee ?? t('calendarWorkflows.task.unassigned')
                      })}
                    </p>
                    <p class="text-sm">
                      ${t('calendarWorkflows.task.due', {
                        date: task.due
                          ? new Date(task.due).toLocaleDateString(this.currentLanguage)
                          : t('common.notAvailable')
                      })}
                    </p>
                    <span class="badge badge-outline">
                      ${t(`dashboard.actions.status.${task.status}` as const)}
                    </span>
                  </div>
                </article>
              `)}
        </div>
      </section>
    `;
  }
}
