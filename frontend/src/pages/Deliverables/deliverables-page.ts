import { html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { DocumentRef } from '../../domain/models';
import { DeliverablesViewModel } from './Deliverables.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('deliverables-page')
export class DeliverablesPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @property({ type: String, attribute: 'project-id' }) projectId = '';

  @state() private assignModalOpen = false;
  @state() private selectedDoc: DocumentRef | null = null;
  @state() private assignee = '';
  @state() private dueDate = '';
  @state() private isLoading = false;
  @state() private loadError: string | null = null;

  #lastLoadedProjectId: string | null = null;
  #loadingFor: string | null = null;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get activeProjectId() {
    return this.projectId || this.projects.activeProjectId || '';
  }

  private get viewModel() {
    return new DeliverablesViewModel(this.projects.value);
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

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    const activeProjectId = this.activeProjectId;
    if (!activeProjectId) {
      this.#lastLoadedProjectId = null;
      this.loadError = null;
      this.isLoading = false;
      return;
    }

    if (activeProjectId === this.#lastLoadedProjectId && !changedProperties.has('projectId')) {
      return;
    }

    this.#lastLoadedProjectId = activeProjectId;
    void this.#loadDeliverables(activeProjectId);
  }

  private translateStatus(status: DocumentRef['status']): string {
    const labels: Record<DocumentRef['status'], string> = {
      Abierto: t('deliverables.status.open'),
      Comenzado: t('deliverables.status.inProgress'),
      'En Revisión': t('deliverables.status.inReview'),
      Terminado: t('deliverables.status.done')
    };
    return labels[status] ?? status;
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

  private async #loadDeliverables(projectId: string): Promise<void> {
    this.#loadingFor = projectId;
    this.isLoading = true;
    this.loadError = null;
    try {
      await this.viewModel.refreshDocuments(projectId);
      if (this.#loadingFor !== projectId) {
        return;
      }
      this.loadError = null;
    } catch (error) {
      if (this.#loadingFor !== projectId) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al cargar entregables';
      this.loadError = message;
    } finally {
      if (this.#loadingFor === projectId) {
        this.isLoading = false;
        this.#loadingFor = null;
      }
    }
  }

  private renderModal(projectTeam: Array<{ id: string; name: string }>) {
    if (!this.assignModalOpen || !this.selectedDoc) return null;
    return html`
      <div class="modal modal-open">
        <div class="modal-box space-y-4">
          <h3 class="font-bold text-lg">${t('deliverables.assignModal.title')}</h3>
          <p class="text-sm text-base-content/70">${this.selectedDoc.name}</p>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('deliverables.assignModal.assignee')}</span></span>
            <select class="select select-bordered" .value=${this.assignee} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.assignee = select.value;
            }}>
              <option value="">${t('deliverables.assignModal.placeholder')}</option>
              ${projectTeam.map((member) => html`<option value=${member.name}>${member.name}</option>`)}
            </select>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('deliverables.assignModal.dueDate')}</span></span>
            <input class="input input-bordered" type="date" .value=${this.dueDate} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.dueDate = input.value;
            }}>
          </label>
          <div class="modal-action">
            <button class="btn" @click=${this.closeAssignModal}>${t('common.cancel')}</button>
            <button class="btn btn-primary" ?disabled=${!this.assignee || !this.dueDate} @click=${this.confirmAssignment}>
              ${t('deliverables.actions.assign')}
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
          <h1 class="text-3xl font-bold">${t('deliverables.title')}</h1>
          <p class="text-base-content/70">${t('deliverables.subtitle')}</p>
        </header>

        ${this.loadError
          ? html`<div class="alert alert-error"><span>${this.loadError}</span></div>`
          : null}

        ${this.isLoading
          ? html`<progress class="progress progress-primary w-full"></progress>`
          : null}

        <div class="overflow-x-auto bg-base-100 shadow rounded-box">
          <table class="table">
            <thead>
              <tr>
                <th>${t('deliverables.columns.name')}</th>
                <th>${t('deliverables.columns.status')}</th>
                <th>${t('deliverables.columns.version')}</th>
                <th class="text-right">${t('deliverables.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map((doc) => html`
                <tr>
                  <td class="font-medium">${doc.name}</td>
                  <td>${this.translateStatus(doc.status)}</td>
                  <td>${doc.version > 0 ? `v${doc.version}` : t('common.notAvailable')}</td>
                  <td class="text-right space-x-2">
                    <button class="btn btn-xs" ?disabled=${!doc.link} @click=${() => window.open(doc.link ?? '#', '_blank')}>
                      ${t('common.view')}
                    </button>
                    <button class="btn btn-xs btn-outline" ?disabled=${this.isLoading} @click=${() => this.handleUpload(doc)}>
                      ${t('deliverables.actions.upload')}
                    </button>
                    <button class="btn btn-xs btn-primary" ?disabled=${this.isLoading} @click=${() => this.openAssignModal(doc)}>
                      ${t('deliverables.actions.assign')}
                    </button>
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
