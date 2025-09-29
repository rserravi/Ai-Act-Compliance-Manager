import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { DocumentRef } from '../../domain/models';
import { DeliverablesViewModel } from './Deliverables.viewmodel';

@customElement('deliverables-page')
export class DeliverablesPage extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  @state() private assignModalOpen = false;
  @state() private selectedDoc: DocumentRef | null = null;
  @state() private assignee = '';
  @state() private dueDate = '';

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get activeProjectId() {
    return this.projectId || this.projects.activeProjectId || '';
  }

  private get viewModel() {
    return new DeliverablesViewModel(this.projects.value);
  }

  private openAssignModal(doc: DocumentRef) {
    this.selectedDoc = doc;
    this.assignModalOpen = true;
    this.assignee = '';
    this.dueDate = '';
  }

  private closeAssignModal() {
    this.assignModalOpen = false;
    this.selectedDoc = null;
  }

  private handleUpload(doc: DocumentRef) {
    this.viewModel.uploadNewVersion(doc.id, doc.version);
  }

  private confirmAssignment() {
    const projectId = this.activeProjectId;
    if (!projectId || !this.selectedDoc || !this.assignee || !this.dueDate) return;
    this.viewModel.createAssignment(projectId, this.selectedDoc, this.assignee, this.dueDate);
    this.closeAssignModal();
  }

  private renderModal(projectTeam: Array<{ id: string; name: string }>) {
    if (!this.assignModalOpen || !this.selectedDoc) return null;
    return html`
      <div class="modal modal-open">
        <div class="modal-box space-y-4">
          <h3 class="font-bold text-lg">Asignar entregable</h3>
          <p class="text-sm text-base-content/70">${this.selectedDoc.name}</p>
          <label class="form-control">
            <span class="label"><span class="label-text">Responsable</span></span>
            <select class="select select-bordered" .value=${this.assignee} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.assignee = select.value;
            }}>
              <option value="">Selecciona un contacto</option>
              ${projectTeam.map((member) => html`<option value=${member.name}>${member.name}</option>`)}
            </select>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">Fecha objetivo</span></span>
            <input class="input input-bordered" type="date" .value=${this.dueDate} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.dueDate = input.value;
            }}>
          </label>
          <div class="modal-action">
            <button class="btn" @click=${this.closeAssignModal}>Cancelar</button>
            <button class="btn btn-primary" ?disabled=${!this.assignee || !this.dueDate} @click=${this.confirmAssignment}>
              Asignar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    const projectId = this.activeProjectId;
    const project = this.viewModel.getProject(projectId);
    const documents = this.viewModel.getDocuments(projectId);

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">Entregables</h1>
          <p class="text-base-content/70">Gestiona la documentación obligatoria del proyecto seleccionado.</p>
        </header>

        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>Entregable</th>
                <th>Estado</th>
                <th>Versión</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map((doc) => html`
                <tr>
                  <td class="font-medium">${doc.name}</td>
                  <td>${doc.status}</td>
                  <td>${doc.version > 0 ? `v${doc.version}` : '—'}</td>
                  <td class="text-right space-x-2">
                    <button class="btn btn-xs" ?disabled=${!doc.link} @click=${() => window.open(doc.link ?? '#', '_blank')}>
                      Ver
                    </button>
                    <button class="btn btn-xs btn-outline" @click=${() => this.handleUpload(doc)}>Subir versión</button>
                    <button class="btn btn-xs btn-primary" @click=${() => this.openAssignModal(doc)}>Asignar</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        ${this.renderModal(project?.team ?? [])}
      </section>
    `;
  }
}
