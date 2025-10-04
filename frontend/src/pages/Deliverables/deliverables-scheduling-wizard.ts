import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { DocumentRef } from '../../domain/models';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('deliverables-scheduling-wizard')
export class DeliverablesSchedulingWizard extends LocalizedElement {
  declare renderRoot: HTMLElement;

  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) deliverables: DocumentRef[] = [];
  @property({ attribute: false }) team: Array<{ id: string; name: string }> = [];
  @property({ type: String }) projectName = '';
  @property({ attribute: false }) assignDeliverable?: (
    deliverable: DocumentRef,
    input: { assignee: string; dueDate: string; createTask: boolean }
  ) => Promise<void>;

  @state() private stepIndex = 0;
  @state() private assignee = '';
  @state() private dueDate = '';
  @state() private createTask = true;
  @state() private submitting = false;
  @state() private error: string | null = null;

  #confirmedDeliverables = new Set<string>();
  #completionEmitted = false;
  #initialPending = 0;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get pendingFromServer(): DocumentRef[] {
    return this.deliverables.filter((doc) => !doc.assignee || !doc.dueDate);
  }

  private get wizardQueue(): DocumentRef[] {
    const pending = this.pendingFromServer;
    if (this.#confirmedDeliverables.size === 0) {
      return pending;
    }
    return pending.filter((doc) => !this.#confirmedDeliverables.has(doc.id));
  }

  private get currentDeliverable(): DocumentRef | null {
    return this.wizardQueue[this.stepIndex] ?? null;
  }

  private get remainingCount(): number {
    return this.wizardQueue.length;
  }

  private get completedCount(): number {
    if (this.#initialPending === 0) {
      return 0;
    }
    const pending = this.pendingFromServer.length;
    return Math.max(this.#initialPending - pending, 0);
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        this.#onOpen();
      } else {
        this.#onClose();
      }
    }

    if (this.open && changedProperties.has('deliverables')) {
      if (this.stepIndex >= this.wizardQueue.length && this.wizardQueue.length > 0) {
        this.stepIndex = 0;
      }
      if (this.pendingFromServer.length === 0) {
        this.#completeWizard();
      }
    }
  }

  #onOpen(): void {
    this.assignee = '';
    this.dueDate = '';
    this.createTask = true;
    this.stepIndex = 0;
    this.error = null;
    this.#confirmedDeliverables.clear();
    this.#completionEmitted = false;
    const pending = this.pendingFromServer.length;
    this.#initialPending = pending;
    if (pending === 0) {
      this.#completeWizard();
    }
  }

  #onClose(): void {
    this.assignee = '';
    this.dueDate = '';
    this.createTask = true;
    this.stepIndex = 0;
    this.error = null;
    this.#confirmedDeliverables.clear();
    this.#completionEmitted = false;
    this.#initialPending = 0;
  }

  async #handleConfirm(): Promise<void> {
    const deliverable = this.currentDeliverable;
    if (!deliverable || !this.assignDeliverable) {
      return;
    }
    if (!this.assignee || !this.dueDate) {
      return;
    }

    this.submitting = true;
    this.error = null;

    try {
      await this.assignDeliverable(deliverable, {
        assignee: this.assignee,
        dueDate: this.dueDate,
        createTask: this.createTask,
      });
      this.#confirmedDeliverables.add(deliverable.id);
      this.assignee = '';
      this.dueDate = '';
      this.createTask = true;
      if (this.wizardQueue.length === 0 && this.pendingFromServer.length === 0) {
        this.#completeWizard();
      } else {
        this.stepIndex = 0;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = t('deliverables.notifications.assignmentFailed');
      }
    } finally {
      this.submitting = false;
    }
  }

  #completeWizard(): void {
    if (this.#completionEmitted) {
      return;
    }
    this.#completionEmitted = true;
    this.dispatchEvent(
      new CustomEvent('deliverables-wizard-complete', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleDismiss(): void {
    this.#completeWizard();
  }

  #updateAssignee(event: Event): void {
    const select = event.currentTarget as HTMLSelectElement;
    this.assignee = select.value;
  }

  #updateDueDate(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.dueDate = input.value;
  }

  #toggleCreateTask(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.createTask = input.checked;
  }

  private renderQueue(): unknown {
    const queue = this.wizardQueue;
    if (queue.length === 0) {
      return null;
    }
    return html`
      <div class="space-y-2">
        <h4 class="text-sm font-semibold uppercase tracking-wide">
          ${t('deliverables.wizard.queueTitle')}
        </h4>
        <ul class="space-y-1 max-h-32 overflow-y-auto pr-1">
          ${queue.map(
            (item, index) => html`
              <li
                class="flex items-center gap-2 rounded-box px-2 py-1 ${index === 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-base-200'}"
              >
                <span class="badge badge-sm ${index === 0 ? 'badge-primary' : 'badge-ghost'}">
                  ${index + 1}
                </span>
                <span class="text-sm ${index === 0 ? 'font-medium' : ''}">${item.name}</span>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  private renderContent(): unknown {
    if (!this.open) {
      return null;
    }

    if (this.pendingFromServer.length === 0) {
      return html`
        <div class="modal modal-open">
          <div class="modal-box space-y-4">
            <h3 class="text-xl font-semibold">
              ${t('deliverables.wizard.completedTitle')}
            </h3>
            <p class="text-sm text-base-content/70">
              ${t('deliverables.wizard.completedDescription', {
                project: this.projectName || t('common.notAvailable'),
              })}
            </p>
            <div class="modal-action">
              <button class="btn btn-primary" type="button" @click=${this.#handleDismiss}>
                ${t('deliverables.wizard.close')}
              </button>
            </div>
          </div>
          <div class="modal-backdrop bg-neutral/50"></div>
        </div>
      `;
    }

    const deliverable = this.currentDeliverable;
    const total = Math.max(this.#initialPending, this.completedCount + this.remainingCount);
    const currentStep = Math.min(this.completedCount + 1, total);

    return html`
      <div class="modal modal-open">
        <div class="modal-box max-w-3xl space-y-6">
          <header class="space-y-2">
            <h3 class="text-xl font-semibold">${t('deliverables.wizard.title')}</h3>
            <p class="text-sm text-base-content/70">
              ${t('deliverables.wizard.description', {
                project: this.projectName || t('common.notAvailable'),
              })}
            </p>
          </header>

          <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span class="badge badge-primary badge-outline">
              ${t('deliverables.wizard.progress', {
                current: currentStep,
                total: Math.max(total, 1),
              })}
            </span>
            <span class="text-base-content/70">
              ${t('deliverables.wizard.remaining', { count: this.remainingCount })}
            </span>
          </div>

          <div class="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div class="space-y-4">
              <div class="space-y-1">
                <h4 class="font-semibold text-lg">${deliverable?.name}</h4>
                <p class="text-sm text-base-content/70">
                  ${t('deliverables.wizard.instructions')}
                </p>
              </div>

              <label class="form-control">
                <span class="label">
                  <span class="label-text">${t('deliverables.wizard.assigneeLabel')}</span>
                </span>
                <select class="select select-bordered" .value=${this.assignee} @change=${this.#updateAssignee}>
                  <option value="">${t('deliverables.wizard.assigneePlaceholder')}</option>
                  ${this.team.map(
                    (member) => html`<option value=${member.name}>${member.name}</option>`,
                  )}
                </select>
              </label>

              <label class="form-control">
                <span class="label">
                  <span class="label-text">${t('deliverables.wizard.dueDateLabel')}</span>
                </span>
                <input
                  class="input input-bordered"
                  type="date"
                  .value=${this.dueDate}
                  @input=${this.#updateDueDate}
                />
              </label>

              <label class="label cursor-pointer justify-start gap-3">
                <input
                  class="checkbox checkbox-primary"
                  type="checkbox"
                  .checked=${this.createTask}
                  @change=${this.#toggleCreateTask}
                />
                <span class="label-text">${t('deliverables.wizard.createTask')}</span>
              </label>

              ${this.error
                ? html`<div class="alert alert-error text-sm">${this.error}</div>`
                : null}
            </div>

            ${this.renderQueue()}
          </div>

          <div class="modal-action">
            <button
              class="btn btn-primary"
              type="button"
              ?disabled=${!this.assignee || !this.dueDate || this.submitting}
              @click=${this.#handleConfirm}
            >
              ${this.submitting
                ? html`<span class="loading loading-spinner"></span>`
                : null}
              <span>${t('deliverables.wizard.confirm')}</span>
            </button>
          </div>
        </div>
        <div class="modal-backdrop bg-neutral/50"></div>
      </div>
    `;
  }

  protected render() {
    return this.renderContent();
  }
}
