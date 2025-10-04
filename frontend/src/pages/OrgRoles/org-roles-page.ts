import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import { getProjectContacts } from './OrgRoles.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';

@customElement('org-roles-page')
export class OrgRolesPage extends LocalizedElement {
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
    const contacts = getProjectContacts(this.projects.value, projectId ?? null);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Roles y contactos</h1>
          <p class="text-base-content/70">
            Referentes y responsables asociados al proyecto ${project?.name ?? 'actual'}.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          ${contacts.length === 0
            ? html`<p class="text-sm text-base-content/70">No hay contactos registrados para este proyecto.</p>`
            : contacts.map((contact) => html`
                <article class="card bg-base-100 shadow">
                  <div class="card-body space-y-2">
                    <h3 class="card-title text-lg">${contact.name}</h3>
                    <p class="text-sm text-base-content/70">${contact.role ?? 'Sin rol definido'}</p>
                    <a class="link" href=${`mailto:${contact.email ?? ''}`}>${contact.email ?? 'Sin correo'}</a>
                  </div>
                </article>
              `)}
        </div>
      </section>
    `;
  }
}
