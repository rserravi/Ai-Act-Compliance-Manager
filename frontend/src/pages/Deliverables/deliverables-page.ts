import { html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { DocumentRef } from '../../domain/models';
import { DeliverablesViewModel } from './Deliverables.viewmodel';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import './deliverables-scheduling-wizard';

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
  @state() private showWizard = false;
  @state() private assignmentInProgress = false;
  @state() private toasts: Array<{ id: number; message: string; type: 'success' | 'error' }> = [];

  #lastLoadedProjectId: string | null = null;
  #loadingFor: string | null = null;
  #wizardAutoStart = false;
  #toastTimeouts = new Map<number, number>();

  constructor() {
    super();
    this.#wizardAutoStart = this.#readWizardFlag();
  }

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get activeProjectId() {
    return this.projectId || this.projects.activeProjectId || '';
  }

  private get viewModel() {
    return new DeliverablesViewModel(this.projects.value);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const timeoutId of this.#toastTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    this.#toastTimeouts.clear();
  }

  private #readWizardFlag(): boolean {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('wizard') === 'schedule';
    } catch (error) {
      console.warn('Unable to read wizard flag', error);
      return false;
    }
  }

  private #clearWizardFlag(): void {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('wizard')) {
        return;
      }
      url.searchParams.delete('wizard');
      const query = url.searchParams.toString();
      const newUrl = `${url.pathname}${query ? `?${query}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      console.warn('Unable to clear wizard flag', error);
    }
  }

  private #maybeOpenWizard(projectId: string): void {
    if (!this.#wizardAutoStart) {
      return;
    }
    const documents = this.viewModel.getDocuments(projectId);
    if (documents.some((doc) => !doc.assignee || !doc.dueDate)) {
      this.showWizard = true;
    }
    this.#wizardAutoStart = false;
  }

  private formatDueDate(value?: string): string {
    if (!value) {
      return t('deliverables.labels.noDueDate');
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString(this.currentLanguage);
  }

  private addToast(message: string, type: 'success' | 'error' = 'success'): void {
    const id = Date.now() + Math.random();
    this.toasts = [...this.toasts, { id, message, type }];
    const timeoutId = window.setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
    this.#toastTimeouts.set(id, timeoutId);
  }

  private dismissToast(id: number): void {
    const timeoutId = this.#toastTimeouts.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      this.#toastTimeouts.delete(id);
    }
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }

  private renderToasts() {
    if (this.toasts.length === 0) {
      return null;
    }
    return html`
      <div class="toast toast-end">
        ${this.toasts.map(
          (toast) => html`
            <div class="alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}">
              <div class="flex items-center justify-between gap-4">
                <span>${toast.message}</span>
                <button class="btn btn-ghost btn-xs" type="button" @click=${() => this.dismissToast(toast.id)}>
                  ✕
                </button>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private async handleWizardAssignment(
    deliverable: DocumentRef,
    input: { assignee: string; dueDate: string; createTask: boolean }
  ): Promise<void> {
    const projectId = this.activeProjectId;
    if (!projectId) {
      const errorMessage = t('deliverables.notifications.assignmentFailed');
      this.addToast(errorMessage, 'error');
      throw new Error(errorMessage);
    }

    this.assignmentInProgress = true;
    try {
      await this.viewModel.assignDeliverable(projectId, deliverable, input.assignee, input.dueDate, {
        createTask: input.createTask
      });
      this.addToast(t('deliverables.notifications.assignmentCreated', { deliverable: deliverable.name }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('deliverables.notifications.assignmentFailed');
      this.addToast(message, 'error');
      throw error instanceof Error ? error : new Error(message);
    } finally {
      this.assignmentInProgress = false;
    }
  }

  private handleWizardComplete(): void {
    this.showWizard = false;
    this.#clearWizardFlag();
    this.addToast(t('deliverables.notifications.assignmentsComplete'));
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

  private async confirmAssignment() {
    const projectId = this.activeProjectId;
    if (!projectId || !this.selectedDoc || !this.assignee || !this.dueDate) return;
    this.assignmentInProgress = true;
    try {
      await this.viewModel.assignDeliverable(projectId, this.selectedDoc, this.assignee, this.dueDate, {
        createTask: true
      });
      this.addToast(t('deliverables.notifications.assignmentCreated', { deliverable: this.selectedDoc.name }));
      this.closeAssignModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('deliverables.notifications.assignmentFailed');
      this.addToast(message, 'error');
    } finally {
      this.assignmentInProgress = false;
    }
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
      this.#maybeOpenWizard(projectId);
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
            <select class="select select-bordered" .value=${this.assignee} ?disabled=${this.assignmentInProgress} @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.assignee = select.value;
            }}>
              <option value="">${t('deliverables.assignModal.placeholder')}</option>
              ${projectTeam.map((member) => html`<option value=${member.name}>${member.name}</option>`)}
            </select>
          </label>
          <label class="form-control">
            <span class="label"><span class="label-text">${t('deliverables.assignModal.dueDate')}</span></span>
            <input class="input input-bordered" type="date" .value=${this.dueDate} ?disabled=${this.assignmentInProgress} @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.dueDate = input.value;
            }}>
          </label>
          <div class="modal-action">
            <button class="btn" ?disabled=${this.assignmentInProgress} @click=${this.closeAssignModal}>${t('common.cancel')}</button>
            <button class="btn btn-primary" ?disabled=${!this.assignee || !this.dueDate || this.assignmentInProgress} @click=${this.confirmAssignment}>
              ${this.assignmentInProgress
                ? html`<span class="loading loading-spinner"></span>`
                : null}
              <span>${t('deliverables.actions.assign')}</span>
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
                <th>${t('deliverables.columns.assignee')}</th>
                <th>${t('deliverables.columns.dueDate')}</th>
                <th class="text-right">${t('deliverables.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map((doc) => html`
                <tr>
                  <td class="font-medium">${doc.name}</td>
                  <td>${this.translateStatus(doc.status)}</td>
                  <td>${doc.version > 0 ? `v${doc.version}` : t('common.notAvailable')}</td>
                  <td>
                    ${doc.assignee
                      ? html`<span class="badge badge-outline badge-primary">${doc.assignee}</span>`
                      : html`<span class="badge badge-ghost">${t('deliverables.labels.unassigned')}</span>`}
                  </td>
                  <td>
                    ${doc.dueDate
                      ? html`<span class="badge badge-outline">${this.formatDueDate(doc.dueDate)}</span>`
                      : html`<span class="badge badge-ghost">${t('deliverables.labels.noDueDate')}</span>`}
                  </td>
                  <td class="text-right space-x-2">
                    <button class="btn btn-xs" ?disabled=${!doc.link} @click=${() => window.open(doc.link ?? '#', '_blank')}>
                      ${t('common.view')}
                    </button>
                    <button class="btn btn-xs btn-outline" ?disabled=${this.isLoading} @click=${() => this.handleUpload(doc)}>
                      ${t('deliverables.actions.upload')}
                    </button>
                    <button class="btn btn-xs btn-primary" ?disabled=${this.isLoading || this.assignmentInProgress} @click=${() => this.openAssignModal(doc)}>
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
      ${this.renderToasts()}
      <deliverables-scheduling-wizard
        .open=${this.showWizard}
        .deliverables=${documents}
        .team=${project?.team?.map((member) => ({ id: member.id, name: member.name })) ?? []}
        .projectName=${project?.name ?? ''}
        .assignDeliverable=${(deliverable, input) => this.handleWizardAssignment(deliverable, input)}
        @deliverables-wizard-complete=${() => this.handleWizardComplete()}
      ></deliverables-scheduling-wizard>
    `;
  }
}
