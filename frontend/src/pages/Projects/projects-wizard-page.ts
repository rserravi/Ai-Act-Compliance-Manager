import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { AISystem, ProjectTeamMember } from '../../domain/models';
import { navigateTo } from '../../navigation';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import { infoCircleIcon } from '../../shared/icons';
import { eventBus } from '../../shared/events/bus';
import {
  ProjectRiskWizardViewModel,
  type RiskWizardQuestion,
  type RiskWizardResult,
  type RiskWizardHelp
} from './ProjectRiskWizard.viewmodel';
import './team-member-form';
import type { TeamMemberFormSubmitDetail } from './team-member-form';

const DEPLOYMENT_OPTIONS = ['sandbox', 'pilot', 'production', 'internal_only'] as const;
const PROJECT_ROLES = ['provider', 'importer', 'distributor', 'user'] as const;
type DeploymentOption = (typeof DEPLOYMENT_OPTIONS)[number];

const PROJECT_DRAFT_STORAGE_KEY = 'projects.newProjectDraft';

type ProjectWizardDraft = {
  tempProjectId: string;
  step: number;
  details: {
    name: string;
    role: AISystem['role'];
    purpose: string;
    owner: string;
    businessUnit: string;
    deployments: DeploymentOption[];
  };
  team: ProjectTeamMember[];
  pendingInvites: string[];
  inviteEmail?: string;
  risk: {
    stepIndex: number;
    answers: Record<string, unknown>;
    result?: RiskWizardResult;
  };
  notes: string;
};

function isDeploymentOption(value: unknown): value is DeploymentOption {
  return (DEPLOYMENT_OPTIONS as readonly string[]).includes(value as DeploymentOption);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isProjectRole(value: unknown): value is AISystem['role'] {
  return (PROJECT_ROLES as readonly string[]).includes(value as AISystem['role']);
}

@customElement('projects-wizard-page')
export class ProjectsWizardPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private static readonly PERSISTED_STATE_KEYS = [
    'step',
    'name',
    'projectRole',
    'purpose',
    'owner',
    'businessUnit',
    'deployments',
    'team',
    'pendingInvites',
    'inviteEmail',
    'riskStepIndex',
    'riskAnswers',
    'riskResult',
    'notes'
  ] as const satisfies ReadonlyArray<PropertyKey>;

  private readonly projects = new ProjectController(this);
  private riskWizard = new ProjectRiskWizardViewModel();

  private tempProjectId: string | null = null;
  private persistenceSuspendedCount = 0;

  @state() private step = 0;
  @state() private name = '';
  @state() private projectRole: AISystem['role'] = 'provider';
  @state() private purpose = '';
  @state() private owner = '';
  @state() private businessUnit = '';
  @state() private deployments: DeploymentOption[] = [];
  @state() private team: ProjectTeamMember[] = [];
  @state() private pendingInvites: string[] = [];
  @state() private inviteEmail = '';
  @state() private riskStepIndex = this.riskWizard.stepIndex;
  @state() private riskResult: RiskWizardResult = this.riskWizard.result;
  @state() private riskAnswers: Record<string, unknown> = this.riskWizard.answers;
  @state() private notes = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.ensureTempProjectId();
    this.restoreDraft();
  }

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get steps() {
    return [
      t('projects.wizard.steps.details'),
      t('projects.wizard.steps.team'),
      t('projects.wizard.steps.riskAssessment'),
      t('projects.wizard.steps.summary')
    ];
  }

  private ensureTempProjectId(): string {
    if (!this.tempProjectId) {
      this.tempProjectId = this.generateTempProjectId();
    }
    return this.tempProjectId;
  }

  private generateTempProjectId(): string {
    return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private withPersistenceSuppressed(mutator: () => void): void {
    this.persistenceSuspendedCount += 1;
    try {
      mutator();
    } finally {
      const updateDone = this.updateComplete;
      void updateDone.finally(() => {
        this.persistenceSuspendedCount = Math.max(0, this.persistenceSuspendedCount - 1);
      });
    }
  }

  private shouldPersistDraft(changedProperties: PropertyValues<this>): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    if (this.persistenceSuspendedCount > 0) {
      return false;
    }
    const changed = changedProperties as Map<PropertyKey, unknown>;
    return ProjectsWizardPage.PERSISTED_STATE_KEYS.some((key) => changed.has(key));
  }

  private persistDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const tempId = this.ensureTempProjectId();
    const draft: ProjectWizardDraft = {
      tempProjectId: tempId,
      step: this.step,
      details: {
        name: this.name,
        role: this.projectRole,
        purpose: this.purpose,
        owner: this.owner,
        businessUnit: this.businessUnit,
        deployments: [...this.deployments]
      },
      team: this.team.map((member) => ({
        ...member,
        raci: { ...member.raci }
      })),
      pendingInvites: this.pendingInvites.filter(isNonEmptyString),
      inviteEmail: this.inviteEmail,
      risk: {
        stepIndex: this.riskStepIndex,
        answers: { ...this.riskAnswers },
        result: this.riskResult ? { ...this.riskResult } : undefined
      },
      notes: this.notes
    };

    try {
      window.localStorage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      eventBus.emit({
        type: 'PROJECT_DRAFT_UPDATED',
        payload: { tempId, storageKey: PROJECT_DRAFT_STORAGE_KEY }
      });
    } catch (error) {
      console.warn('projects-wizard-page: unable to persist draft', error);
    }
  }

  private restoreDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(PROJECT_DRAFT_STORAGE_KEY);
    if (!stored) {
      return;
    }

    let parsed: ProjectWizardDraft | null = null;
    try {
      parsed = JSON.parse(stored) as ProjectWizardDraft;
    } catch (error) {
      console.warn('projects-wizard-page: unable to parse stored draft', error);
      window.localStorage.removeItem(PROJECT_DRAFT_STORAGE_KEY);
      return;
    }

    if (!parsed) {
      return;
    }

    this.withPersistenceSuppressed(() => {
      if (isNonEmptyString(parsed.tempProjectId)) {
        this.tempProjectId = parsed.tempProjectId;
      }

      this.step = this.clampStep(parsed.step);
      this.name = typeof parsed.details?.name === 'string' ? parsed.details.name : '';
      const storedRole = parsed.details?.role;
      this.projectRole = isProjectRole(storedRole) ? storedRole : 'provider';
      this.purpose = typeof parsed.details?.purpose === 'string' ? parsed.details.purpose : '';
      this.owner = typeof parsed.details?.owner === 'string' ? parsed.details.owner : '';
      this.businessUnit =
        typeof parsed.details?.businessUnit === 'string' ? parsed.details.businessUnit : '';
      this.deployments = Array.isArray(parsed.details?.deployments)
        ? parsed.details.deployments.filter(isDeploymentOption)
        : [];

      this.team = this.restoreTeamMembers(parsed.team);
      this.pendingInvites = Array.isArray(parsed.pendingInvites)
        ? parsed.pendingInvites.filter(isNonEmptyString)
        : [];
      this.inviteEmail = typeof parsed.inviteEmail === 'string' ? parsed.inviteEmail : '';
      this.notes = typeof parsed.notes === 'string' ? parsed.notes : '';

      this.restoreRiskWizard(parsed.risk);
    });
  }

  private restoreTeamMembers(raw: unknown): ProjectTeamMember[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    const members: ProjectTeamMember[] = [];
    for (const candidate of raw) {
      if (!candidate || typeof candidate !== 'object') {
        continue;
      }
      const data = candidate as Record<string, unknown>;
      if (
        typeof data.id !== 'string' ||
        typeof data.name !== 'string' ||
        typeof data.role !== 'string' ||
        typeof data.email !== 'string'
      ) {
        continue;
      }
      const raciSource =
        data.raci && typeof data.raci === 'object' ? (data.raci as Record<string, unknown>) : {};
      members.push({
        id: data.id,
        name: data.name,
        role: data.role,
        email: data.email,
        phone: typeof data.phone === 'string' ? data.phone : '',
        notification: typeof data.notification === 'string' ? data.notification : 'email',
        raci: {
          responsible: Boolean(raciSource.responsible),
          accountable: Boolean(raciSource.accountable),
          consulted: Boolean(raciSource.consulted),
          informed: Boolean(raciSource.informed)
        },
        isOwner: Boolean(data.isOwner),
        isReviewer: Boolean(data.isReviewer)
      });
    }
    return members;
  }

  private restoreRiskWizard(risk?: ProjectWizardDraft['risk']): void {
    this.riskWizard = new ProjectRiskWizardViewModel();
    if (!risk || typeof risk !== 'object') {
      this.updateRiskState();
      return;
    }

    const answers = risk.answers && typeof risk.answers === 'object' ? risk.answers : {};
    for (const [questionId, value] of Object.entries(answers)) {
      this.riskWizard.setAnswer(questionId, value);
    }

    const targetStep = this.clampRiskStep(risk.stepIndex);
    while (this.riskWizard.stepIndex < targetStep && !this.riskWizard.isComplete) {
      this.riskWizard.nextStep();
    }

    this.updateRiskState();
  }

  private clampStep(step: unknown): number {
    const numeric = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 0;
    const max = this.steps.length - 1;
    return Math.min(Math.max(0, numeric), max);
  }

  private clampRiskStep(step: unknown): number {
    const numeric = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 0;
    const max = this.riskWizard.steps.length - 1;
    return Math.min(Math.max(0, numeric), max);
  }

  private clearDraft(notifySyncAgent: boolean): void {
    const previousTempId = this.tempProjectId;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(PROJECT_DRAFT_STORAGE_KEY);
      } catch (error) {
        console.warn('projects-wizard-page: unable to clear stored draft', error);
      }
    }
    this.tempProjectId = null;

    if (notifySyncAgent && previousTempId) {
      eventBus.emit({
        type: 'PROJECT_DRAFT_CLEARED',
        payload: { tempId: previousTempId, storageKey: PROJECT_DRAFT_STORAGE_KEY }
      });
    }
  }

  private resetWizardState(): void {
    this.withPersistenceSuppressed(() => {
      this.step = 0;
      this.name = '';
      this.projectRole = 'provider';
      this.purpose = '';
      this.owner = '';
      this.businessUnit = '';
      this.deployments = [];
      this.team = [];
      this.pendingInvites = [];
      this.inviteEmail = '';
      this.notes = '';
      this.riskWizard = new ProjectRiskWizardViewModel();
      this.updateRiskState();
    });
  }

  private handleMemberAdded(event: CustomEvent<TeamMemberFormSubmitDetail>) {
    const detail = event.detail;
    const member: ProjectTeamMember = {
      id: `contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: detail.name,
      role: detail.role,
      email: detail.email,
      phone: '',
      notification: 'email',
      raci: { ...detail.raci },
      isOwner: detail.isOwner,
      isReviewer: detail.isReviewer
    };

    this.team = [...this.team, member];
  }

  private handleInviteInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.inviteEmail = input.value;
  }

  private addPendingInvite(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) {
      return;
    }
    const email = this.inviteEmail.trim();
    if (!email) {
      return;
    }
    if (this.pendingInvites.includes(email)) {
      this.inviteEmail = '';
      return;
    }
    this.pendingInvites = [...this.pendingInvites, email];
    this.inviteEmail = '';
  }

  private removePendingInvite(email: string) {
    this.pendingInvites = this.pendingInvites.filter((value) => value !== email);
  }

  private removeTeamMember(id: string) {
    this.team = this.team.filter((member) => member.id !== id);
  }

  private renderRaciBadges(member: ProjectTeamMember) {
    const labels: Array<Parameters<typeof t>[0]> = [];
    if (member.raci.responsible) {
      labels.push('projects.wizard.team.raci.responsible');
    }
    if (member.raci.accountable) {
      labels.push('projects.wizard.team.raci.accountable');
    }
    if (member.raci.consulted) {
      labels.push('projects.wizard.team.raci.consulted');
    }
    if (member.raci.informed) {
      labels.push('projects.wizard.team.raci.informed');
    }

    if (labels.length === 0) {
      return html`<span class="text-sm text-base-content/70">${t('projects.wizard.team.raci.none')}</span>`;
    }

    return html`<div class="flex flex-wrap gap-1">
      ${labels.map((label) => html`<span class="badge badge-outline">${t(label)}</span>`) }
    </div>`;
  }

  private renderTeamTable() {
    return html`
      <div class="card border border-base-300 shadow-sm">
        <div class="card-body space-y-4">
          <header class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-lg font-semibold">${t('projects.wizard.fields.team')}</h3>
            <span class="badge badge-neutral">${t('projects.wizard.summary.teamCount', { count: this.team.length })}</span>
          </header>
          ${this.team.length === 0
            ? html`<p class="text-sm text-base-content/70">${t('projects.wizard.team.empty')}</p>`
            : html`
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>${t('projects.wizard.contact.name')}</th>
                        <th>${t('projects.wizard.contact.role')}</th>
                        <th>${t('projects.wizard.contact.email')}</th>
                        <th>${t('projects.wizard.team.table.responsibilities')}</th>
                        <th>${t('projects.wizard.team.table.owner')}</th>
                        <th>${t('projects.wizard.team.table.reviewer')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.team.map(
                        (member) => html`
                          <tr>
                            <td>${member.name}</td>
                            <td>${member.role}</td>
                            <td>${member.email}</td>
                            <td>${this.renderRaciBadges(member)}</td>
                            <td>${member.isOwner
                              ? t('projects.wizard.team.owner.yes')
                              : t('projects.wizard.team.owner.no')}</td>
                            <td>${member.isReviewer
                              ? t('projects.wizard.team.reviewer.yes')
                              : t('projects.wizard.team.reviewer.no')}</td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-ghost btn-xs"
                                @click=${() => this.removeTeamMember(member.id)}
                              >
                                ${t('common.remove')}
                              </button>
                            </td>
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderPendingInvitesSection() {
    return html`
      <div class="card border border-base-300 shadow-sm">
        <div class="card-body space-y-4">
          <header>
            <h3 class="text-lg font-semibold">${t('projects.wizard.team.invites.title')}</h3>
            <p class="text-sm text-base-content/70">${t('projects.wizard.team.invites.description')}</p>
          </header>
          <form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" @submit=${this.addPendingInvite}>
            <label class="form-control">
              <span class="label"><span class="label-text">${t('projects.wizard.contact.email')}</span></span>
              <input
                class="input input-bordered"
                type="email"
                .value=${this.inviteEmail}
                required
                placeholder=${t('projects.wizard.team.invites.placeholder')}
                @input=${this.handleInviteInput}
              >
            </label>
            <div class="flex items-end">
              <button class="btn btn-sm" type="submit">${t('projects.wizard.team.invites.add')}</button>
            </div>
          </form>
          ${this.pendingInvites.length === 0
            ? html`<p class="text-sm text-base-content/70">${t('projects.wizard.team.invites.empty')}</p>`
            : html`
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>${t('projects.wizard.contact.email')}</th>
                        <th>${t('projects.wizard.team.invites.status')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.pendingInvites.map(
                        (email) => html`
                          <tr>
                            <td>${email}</td>
                            <td><span class="badge badge-outline">${t('projects.wizard.team.invites.pending')}</span></td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-ghost btn-xs"
                                @click=${() => this.removePendingInvite(email)}
                              >
                                ${t('projects.wizard.team.invites.remove')}
                              </button>
                            </td>
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private cancelWizard() {
    this.clearDraft(true);
    this.resetWizardState();
    navigateTo('/projects', { replace: true });
  }

  private nextStep() {
    if (this.step === 2 && !this.riskWizard.isComplete) {
      this.riskWizard.nextStep();
      this.updateRiskState();
      return;
    }

    if (this.step < this.steps.length - 1) {
      this.step += 1;
      return;
    }

    const result = this.riskResult;
    const project = this.projects.value.createProject({
      name: this.name,
      role: this.projectRole,
      purpose: this.purpose,
      owner: this.owner,
      team: this.team,
      businessUnit: this.businessUnit,
      deployments: this.deployments,
      risk: result?.classification,
      riskAssessment: result
        ? {
            classification: result.classification,
            justification: result.justification,
            answers: this.riskWizard.answersList
          }
        : undefined
    });
    this.clearDraft(true);
    this.resetWizardState();
    navigateTo(`/projects/${project.id}/deliverables`, { replace: true });
  }

  private prevStep() {
    if (this.step === 2 && !this.riskWizard.isOnFirstStep) {
      this.riskWizard.previousStep();
      this.updateRiskState();
      return;
    }
    this.step = Math.max(0, this.step - 1);
  }

  private updateRiskState() {
    this.riskStepIndex = this.riskWizard.stepIndex;
    this.riskResult = this.riskWizard.result;
    this.riskAnswers = this.riskWizard.answers;
  }

  private handleNameChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.name = input.value;
  }

  private handlePurposeChange(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.purpose = textarea.value;
  }

  private handleOwnerChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.owner = input.value;
  }

  private handleBusinessUnitChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.businessUnit = input.value;
  }

  private handleDeploymentToggle(option: DeploymentOption, checked: boolean) {
    if (checked) {
      if (!this.deployments.includes(option)) {
        this.deployments = [...this.deployments, option];
      }
      return;
    }
    this.deployments = this.deployments.filter((deployment) => deployment !== option);
  }

  private renderStepIndicator() {
    return html`
      <ul class="steps">
        ${this.steps.map((label, index) => html`
          <li class="step ${index <= this.step ? 'step-primary' : ''}">${label}</li>
        `)}
      </ul>
    `;
  }

  private renderDetailsStep() {
    return html`
      <div class="grid gap-4 md:grid-cols-2">
        <label class="form-control">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.name')}</span></span>
          <input
            class="input input-bordered"
            .value=${this.name}
            @input=${this.handleNameChange}
            @change=${this.handleNameChange}
            required
          >
        </label>
        <label class="form-control">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.role')}</span></span>
          <select
            class="select select-bordered"
            .value=${this.projectRole}
            @change=${(event: Event) => {
              const select = event.currentTarget as HTMLSelectElement;
              this.projectRole = select.value as AISystem['role'];
            }}
          >
            <option value="provider">${t('roles.provider')}</option>
            <option value="importer">${t('roles.importer')}</option>
            <option value="distributor">${t('roles.distributor')}</option>
            <option value="user">${t('roles.user')}</option>
          </select>
        </label>
        <label class="form-control md:col-span-2">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.purpose')}</span></span>
          <textarea
            class="textarea textarea-bordered"
            rows="3"
            .value=${this.purpose}
            placeholder=${t('projects.wizard.placeholders.purpose')}
            @input=${this.handlePurposeChange}
            @change=${this.handlePurposeChange}
            required
          ></textarea>
        </label>
        <label class="form-control">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.owner')}</span></span>
          <input
            class="input input-bordered"
            .value=${this.owner}
            placeholder=${t('projects.wizard.placeholders.owner')}
            @input=${this.handleOwnerChange}
            @change=${this.handleOwnerChange}
            required
          >
        </label>
        <label class="form-control md:col-span-2">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.businessUnit')}</span></span>
          <input
            class="input input-bordered"
            .value=${this.businessUnit}
            @input=${this.handleBusinessUnitChange}
            @change=${this.handleBusinessUnitChange}
            placeholder=${t('projects.wizard.placeholders.businessUnit')}
          >
        </label>
        <label class="form-control md:col-span-2">
          <span class="label">
            <span class="label-text">${t('projects.wizard.fields.deployments')}</span>
            <span class="label-text-alt">${t('projects.wizard.deployments.helper')}</span>
          </span>
          <div class="space-y-2 rounded-lg border border-base-300 p-4">
            ${DEPLOYMENT_OPTIONS.map((option) => {
              const selected = this.deployments.includes(option);
              return html`
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    class="checkbox checkbox-sm"
                    type="checkbox"
                    .checked=${selected}
                    @change=${(event: Event) => {
                      const input = event.currentTarget as HTMLInputElement;
                      this.handleDeploymentToggle(option, input.checked);
                    }}
                  >
                  <span>${t(`projects.wizard.deployments.options.${option}` as const)}</span>
                </label>
              `;
            })}
          </div>
          ${this.deployments.length === 0
            ? html`<span class="mt-2 text-sm text-error">${t('projects.wizard.validations.deployments')}</span>`
            : null}
        </label>
      </div>
    `;
  }

  private renderTeamStep() {
    return html`
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <team-member-form
          @member-added=${(event: CustomEvent<TeamMemberFormSubmitDetail>) => this.handleMemberAdded(event)}
        ></team-member-form>
        <div class="space-y-6">
          ${this.renderTeamTable()}
          ${this.renderPendingInvitesSection()}
        </div>
      </div>
    `;
  }

  private renderRiskStep() {
    const steps = this.riskWizard.steps;
    const currentStep = this.riskWizard.currentStep;
    const isResultStep = Boolean(currentStep.rules && currentStep.default);

    return html`
      <div class="space-y-6">
        <div class="overflow-x-auto">
          <ul class="steps steps-vertical md:steps-horizontal">
            ${steps.map(
              (step, index) => html`<li class="step ${index <= this.riskStepIndex ? 'step-primary' : ''}">${
                step.title
              }</li>`
            )}
          </ul>
        </div>

        <div class="space-y-4">
          <div class="flex items-start gap-2">
            <h2 class="text-xl font-semibold">${currentStep.title}</h2>
            ${currentStep.help ? this.renderRiskStepHelp(currentStep.id, currentStep.help) : null}
          </div>

          ${currentStep.questions?.map((question) => this.renderRiskQuestion(question)) ?? null}

          ${isResultStep ? this.renderRiskResult() : null}
        </div>
      </div>
    `;
  }

  private renderRiskStepHelp(stepId: string, help: RiskWizardHelp) {
    const tooltipId = `risk-help-${stepId}`;
    return html`
      <div class="relative inline-flex group">
        <button
          type="button"
          class="btn btn-circle btn-ghost btn-xs"
          aria-label=${t('projects.wizard.help.ariaLabel')}
          aria-describedby=${tooltipId}
        >
          ${infoCircleIcon()}
        </button>
        <div
          id=${tooltipId}
          role="tooltip"
          class="pointer-events-none absolute right-0 top-full mt-2 w-72 max-w-sm rounded-md bg-base-200 p-4 text-sm shadow-lg opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        >
          <p class="mb-2">${help.text}</p>
          ${help.links && help.links.length
            ? html`
                <ul class="space-y-1">
                  ${help.links.map(
                    (link) => html`
                      <li>
                        <a class="link link-primary" href=${link.url} target="_blank" rel="noopener noreferrer">
                          ${link.title}
                        </a>
                      </li>
                    `
                  )}
                </ul>
              `
            : null}
        </div>
      </div>
    `;
  }

  private renderRiskQuestion(question: RiskWizardQuestion, nested = false): unknown {
    const answer = this.riskAnswers[question.id];
    const containerClass = nested ? 'mt-4' : '';

    switch (question.type) {
      case 'boolean':
        return html`
          <fieldset class="form-control ${containerClass}">
            <legend class="label"><span class="label-text">${question.text}</span></legend>
            <div class="flex flex-wrap gap-4">
              <label class="label cursor-pointer gap-2">
                <input
                  class="radio radio-primary"
                  type="radio"
                  name=${question.id}
                  value="true"
                  .checked=${answer === true}
                  @change=${() => this.handleBooleanAnswer(question, true)}
                >
                <span>${t('riskWizard.form.yes')}</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input
                  class="radio"
                  type="radio"
                  name=${question.id}
                  value="false"
                  .checked=${answer === false}
                  @change=${() => this.handleBooleanAnswer(question, false)}
                >
                <span>${t('riskWizard.form.no')}</span>
              </label>
            </div>
          </fieldset>
          ${question.conditional && answer === question.conditional.on
            ? html`<div class="mt-4 border-l border-base-300 pl-4">
                ${this.renderRiskQuestion(question.conditional.question, true)}
              </div>`
            : null}
        `;
      case 'select':
        return html`
          <label class="form-control ${containerClass}">
            <span class="label"><span class="label-text">${question.text}</span></span>
            <select
              class="select select-bordered"
              .value=${typeof answer === 'string' ? answer : ''}
              @change=${(event: Event) => {
                const select = event.currentTarget as HTMLSelectElement;
                this.handleSelectAnswer(question.id, select.value);
              }}
            >
              <option value="">${t('riskWizard.form.selectPlaceholder')}</option>
              ${(question.options ?? []).map(
                (option) => html`<option value=${option}>${option}</option>`
              )}
            </select>
          </label>
        `;
      case 'multiselect':
        return html`
          <fieldset class="form-control ${containerClass}">
            <legend class="label"><span class="label-text">${question.text}</span></legend>
            <div class="space-y-2">
              ${(question.options ?? []).map((option) => {
                const selected = Array.isArray(answer) ? (answer as unknown[]).includes(option) : false;
                return html`
                  <label class="label cursor-pointer justify-start gap-3">
                    <input
                      class="checkbox checkbox-sm"
                      type="checkbox"
                      .checked=${selected}
                      @change=${(event: Event) => {
                        const input = event.currentTarget as HTMLInputElement;
                        this.handleMultiselectAnswer(question.id, option, input.checked);
                      }}
                    >
                    <span>${option}</span>
                  </label>
                `;
              })}
            </div>
          </fieldset>
        `;
      case 'text':
      default:
        return html`
          <label class="form-control ${containerClass}">
            <span class="label"><span class="label-text">${question.text}</span></span>
            <textarea
              class="textarea textarea-bordered"
              rows="3"
              .value=${typeof answer === 'string' ? (answer as string) : ''}
              @input=${(event: Event) => {
                const textarea = event.currentTarget as HTMLTextAreaElement;
                this.handleTextAnswer(question.id, textarea.value);
              }}
            ></textarea>
          </label>
        `;
    }
  }

  private handleBooleanAnswer(question: RiskWizardQuestion, value: boolean) {
    this.riskWizard.setAnswer(question.id, value);
    if (question.conditional && value !== question.conditional.on) {
      this.riskWizard.clearAnswer(question.conditional.question.id);
    }
    this.updateRiskState();
  }

  private handleSelectAnswer(questionId: string, value: string) {
    if (!value) {
      this.riskWizard.clearAnswer(questionId);
    } else {
      this.riskWizard.setAnswer(questionId, value);
    }
    this.updateRiskState();
  }

  private handleMultiselectAnswer(questionId: string, option: string, checked: boolean) {
    const current = Array.isArray(this.riskAnswers[questionId])
      ? [...(this.riskAnswers[questionId] as string[])]
      : [];
    if (checked) {
      if (!current.includes(option)) current.push(option);
    } else {
      const index = current.indexOf(option);
      if (index >= 0) current.splice(index, 1);
    }
    if (current.length === 0) {
      this.riskWizard.clearAnswer(questionId);
    } else {
      this.riskWizard.setAnswer(questionId, current);
    }
    this.updateRiskState();
  }

  private handleTextAnswer(questionId: string, value: string) {
    if (!value.trim()) {
      this.riskWizard.clearAnswer(questionId);
    } else {
      this.riskWizard.setAnswer(questionId, value);
    }
    this.updateRiskState();
  }

  private renderRiskResult() {
    const result = this.riskResult;
    const classificationLabel = t(`riskLevels.${result.classification}` as const);
    const resultCopyKey = `riskWizard.results.${result.classification}` as const;
    const implications = t(`${resultCopyKey}.implications` as const);
    const nextSteps = t(`${resultCopyKey}.next_steps` as const, {
      returnObjects: true
    }) as string[];

    return html`
      <article class="rounded-lg border border-base-300 bg-base-200/40 p-4">
        <h3 class="text-lg font-semibold">${t('riskWizard.result.title')}</h3>
        <dl class="mt-3 space-y-2">
          <div>
            <dt class="text-sm font-medium text-base-content/70">
              ${t('riskWizard.result.classificationLabel')}
            </dt>
            <dd class="text-base font-semibold capitalize">${classificationLabel}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-base-content/70">
              ${t('riskWizard.result.justification')}
            </dt>
            <dd>${result.justification}</dd>
          </div>
        </dl>

        ${implications
          ? html`<p class="mt-4 text-sm">${t('riskWizard.result.implications')}</p>
              <p class="text-sm text-base-content/80">${implications}</p>`
          : null}

        ${Array.isArray(nextSteps) && nextSteps.length
          ? html`
              <div class="mt-4">
                <p class="text-sm font-medium text-base-content/70">
                  ${t('riskWizard.result.nextSteps')}
                </p>
                <ul class="list-disc space-y-1 pl-5 text-sm">
                  ${nextSteps.map((step) => html`<li>${step}</li>`)}
                </ul>
              </div>
            `
          : null}
      </article>

      <label class="form-control">
        <span class="label"><span class="label-text">${t('projects.wizard.fields.notes')}</span></span>
        <textarea
          class="textarea textarea-bordered"
          rows="4"
          .value=${this.notes}
          placeholder=${t('projects.wizard.placeholders.notes')}
          @input=${(event: Event) => {
            const textarea = event.currentTarget as HTMLTextAreaElement;
            this.notes = textarea.value;
          }}
        ></textarea>
      </label>
    `;
  }

  private renderSummaryStep() {
    return html`
      <div class="space-y-4">
        <article class="prose">
          <h2>${t('projects.wizard.summary.title')}</h2>
          <p><strong>${t('projects.wizard.fields.name')}:</strong> ${this.name}</p>
          <p><strong>${t('projects.wizard.fields.role')}:</strong> ${t(`roles.${this.projectRole}` as const)}</p>
          <p><strong>${t('projects.wizard.fields.purpose')}:</strong> ${
            this.purpose || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.owner')}:</strong> ${
            this.owner || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.businessUnit')}:</strong> ${
            this.businessUnit || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.deployments')}:</strong> ${
            this.deployments.length
              ? this.deployments
                  .map((deployment) => t(`projects.wizard.deployments.options.${deployment}` as const))
                  .join(', ')
              : t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.risk')}:</strong> ${
            this.riskResult ? t(`riskLevels.${this.riskResult.classification}` as const) : t('projects.wizard.summary.unclassifiedRisk')
          }</p>
          <p><strong>${t('projects.wizard.summary.justification')}:</strong> ${
            this.riskResult?.justification ?? t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.summary.contacts')}:</strong> ${t(
            'projects.wizard.summary.teamCount',
            { count: this.team.length }
          )}</p>
          <p><strong>${t('projects.wizard.team.invites.summaryLabel')}:</strong> ${
            this.pendingInvites.length
              ? t('projects.wizard.team.invites.summary', { count: this.pendingInvites.length })
              : t('projects.wizard.team.invites.empty')
          }</p>
          <p><strong>${t('projects.wizard.fields.notes')}:</strong> ${
            this.notes || t('projects.wizard.summary.noNotes')
          }</p>
        </article>
      </div>
    `;
  }

  private renderCurrentStep() {
    switch (this.step) {
      case 0:
        return this.renderDetailsStep();
      case 1:
        return this.renderTeamStep();
      case 2:
        return this.renderRiskStep();
      default:
        return this.renderSummaryStep();
    }
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (this.shouldPersistDraft(changedProperties)) {
      this.persistDraft();
    }
  }

  private canContinueToNextStep(): boolean {
    if (this.step === 0) {
      const hasName = this.name.trim().length > 0;
      const hasPurpose = this.purpose.trim().length > 0;
      const hasOwner = this.owner.trim().length > 0;
      const hasDeployments = this.deployments.length > 0;
      return hasName && hasPurpose && hasOwner && hasDeployments;
    }

    return true;
  }

  protected render() {
    const canContinue = this.canContinueToNextStep();

    return html`
      <section class="space-y-6">
        <header class="space-y-1">
          <h1 class="text-3xl font-bold">${t('projects.wizard.title')}</h1>
          <p class="text-base-content/70">${t('projects.wizard.subtitle')}</p>
        </header>

        ${this.renderStepIndicator()}

        <div class="card bg-base-100 shadow">
          <div class="card-body space-y-6">
            ${this.renderCurrentStep()}
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-ghost" type="button" @click=${this.cancelWizard}>
                  ${t('common.cancel')}
                </button>
                <button class="btn" type="button" ?disabled=${this.step === 0} @click=${this.prevStep}>
                  ${t('common.back')}
                </button>
              </div>
              <button class="btn btn-primary" type="button" ?disabled=${!canContinue} @click=${this.nextStep}>
                ${this.step === this.steps.length - 1
                  ? t('projects.wizard.finish')
                  : t('common.next')}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
