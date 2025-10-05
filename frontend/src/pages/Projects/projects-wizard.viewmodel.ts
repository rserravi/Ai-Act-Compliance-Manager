import type { ReactiveController, ReactiveElement } from 'lit';
import type { AISystem, ProjectTeamMember } from '../../domain/models';
import { navigateTo } from '../../navigation';
import { ProjectController } from '../../state/controllers';
import { eventBus } from '../../shared/events/bus';
import { ProjectRiskWizardViewModel } from './ProjectRiskWizard.viewmodel';
import type { TeamMemberFormSubmitDetail } from './team-member-form';
import {
  DEPLOYMENT_OPTIONS,
  type DeploymentOption,
  PROJECT_ROLE_OPTIONS,
  type ProjectWizardDraft,
  type RiskWizardQuestion,
  type RiskWizardResult,
  type RiskWizardStep
} from './Model';
import {
  createProject as createProjectRequest,
  fetchProjectDeliverables as fetchProjectDeliverablesFromApi,
  fetchProjects as fetchProjectsFromApi,
} from './Service/projects.service';

const PROJECT_DRAFT_STORAGE_KEY = 'projects.newProjectDraft';
const WIZARD_STEP_IDS = ['details', 'team', 'riskAssessment', 'summary'] as const;

export type WizardStepId = (typeof WIZARD_STEP_IDS)[number];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDeploymentOption(value: unknown): value is DeploymentOption {
  return (DEPLOYMENT_OPTIONS as readonly string[]).includes(value as DeploymentOption);
}

function isProjectRole(value: unknown): value is AISystem['role'] {
  return (PROJECT_ROLE_OPTIONS as readonly string[]).includes(value as AISystem['role']);
}

type WizardState = {
  step: number;
  name: string;
  projectRole: AISystem['role'];
  purpose: string;
  owner: string;
  businessUnit: string;
  deployments: DeploymentOption[];
  team: ProjectTeamMember[];
  pendingInvites: string[];
  inviteEmail: string;
  riskStepIndex: number;
  riskResult?: RiskWizardResult;
  isRiskEvaluating: boolean;
  riskError?: string;
  riskAnswers: Record<string, unknown>;
  notes: string;
  isSubmitting: boolean;
  submitError?: string;
};

export class ProjectsWizardViewModel implements ReactiveController {
  readonly steps: ReadonlyArray<WizardStepId> = WIZARD_STEP_IDS;

  #host: ReactiveElement;
  #projects: ProjectController;
  #riskWizard: ProjectRiskWizardViewModel;
  #state: WizardState = {
    step: 0,
    name: '',
    projectRole: 'provider',
    purpose: '',
    owner: '',
    businessUnit: '',
    deployments: [],
    team: [],
    pendingInvites: [],
    inviteEmail: '',
    riskStepIndex: 0,
    riskResult: undefined,
    isRiskEvaluating: false,
    riskError: undefined,
    riskAnswers: {},
    notes: '',
    isSubmitting: false,
    submitError: undefined,
  };
  #tempProjectId: string | null = null;
  #persistenceSuspended = 0;

  constructor(host: ReactiveElement) {
    this.#host = host;
    host.addController(this);
    this.#projects = new ProjectController(host);
    this.#riskWizard = this.#createRiskWizard();
    this.#syncRiskState();
  }

  hostConnected(): void {
    this.#projects.value.setActiveProjectId(null);
    this.#ensureTempProjectId();
    this.#restoreDraft();
  }

  get step(): number {
    return this.#state.step;
  }

  get name(): string {
    return this.#state.name;
  }

  get projectRole(): AISystem['role'] {
    return this.#state.projectRole;
  }

  get purpose(): string {
    return this.#state.purpose;
  }

  get owner(): string {
    return this.#state.owner;
  }

  get businessUnit(): string {
    return this.#state.businessUnit;
  }

  get deployments(): ReadonlyArray<DeploymentOption> {
    return this.#state.deployments;
  }

  get team(): ReadonlyArray<ProjectTeamMember> {
    return this.#state.team;
  }

  get pendingInvites(): ReadonlyArray<string> {
    return this.#state.pendingInvites;
  }

  get inviteEmail(): string {
    return this.#state.inviteEmail;
  }

  get riskStepIndex(): number {
    return this.#state.riskStepIndex;
  }

  get riskResult(): RiskWizardResult | undefined {
    return this.#state.riskResult;
  }

  get isRiskEvaluationLoading(): boolean {
    return this.#state.isRiskEvaluating;
  }

  get riskEvaluationError(): string | undefined {
    return this.#state.riskError;
  }

  get riskAnswers(): Record<string, unknown> {
    return this.#state.riskAnswers;
  }

  get notes(): string {
    return this.#state.notes;
  }

  get isSubmitting(): boolean {
    return this.#state.isSubmitting;
  }

  get submissionError(): string | undefined {
    return this.#state.submitError;
  }

  get riskSteps(): ReadonlyArray<RiskWizardStep> {
    return this.#riskWizard.steps;
  }

  get currentRiskStep(): RiskWizardStep {
    return this.#riskWizard.currentStep;
  }

  get isRiskWizardComplete(): boolean {
    return this.#riskWizard.isComplete;
  }

  get isRiskWizardOnFirstStep(): boolean {
    return this.#riskWizard.isOnFirstStep;
  }

  get riskAnswersList() {
    return this.#riskWizard.answersList;
  }

  retryRiskEvaluation(): void {
    this.#riskWizard.retryEvaluation();
  }

  setName(value: string): void {
    this.#updateState(() => {
      this.#state.name = value;
    });
  }

  setPurpose(value: string): void {
    this.#updateState(() => {
      this.#state.purpose = value;
    });
  }

  setOwner(value: string): void {
    this.#updateState(() => {
      this.#state.owner = value;
    });
  }

  setBusinessUnit(value: string): void {
    this.#updateState(() => {
      this.#state.businessUnit = value;
    });
  }

  setProjectRole(role: AISystem['role']): void {
    this.#updateState(() => {
      this.#state.projectRole = role;
    });
  }

  toggleDeployment(option: DeploymentOption, enabled: boolean): void {
    this.#updateState(() => {
      if (enabled) {
        if (!this.#state.deployments.includes(option)) {
          this.#state.deployments = [...this.#state.deployments, option];
        }
        return;
      }
      this.#state.deployments = this.#state.deployments.filter((value) => value !== option);
    });
  }

  addTeamMember(detail: TeamMemberFormSubmitDetail): void {
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

    this.#updateState(() => {
      this.#state.team = [...this.#state.team, member];
    });
  }

  removeTeamMember(id: string): void {
    this.#updateState(() => {
      this.#state.team = this.#state.team.filter((member) => member.id !== id);
    });
  }

  setInviteEmail(value: string): void {
    this.#updateState(() => {
      this.#state.inviteEmail = value;
    }, { persist: false });
  }

  addPendingInvite(): void {
    this.#updateState(() => {
      const email = this.#state.inviteEmail.trim();
      if (!email) {
        return;
      }
      if (this.#state.pendingInvites.includes(email)) {
        this.#state.inviteEmail = '';
        return;
      }
      this.#state.pendingInvites = [...this.#state.pendingInvites, email];
      this.#state.inviteEmail = '';
    });
  }

  removePendingInvite(email: string): void {
    this.#updateState(() => {
      this.#state.pendingInvites = this.#state.pendingInvites.filter((value) => value !== email);
    });
  }

  setNotes(value: string): void {
    this.#updateState(() => {
      this.#state.notes = value;
    });
  }

  canContinueToNextStep(): boolean {
    if (this.#state.isSubmitting) {
      return false;
    }
    if (this.#state.step === 0) {
      const hasName = this.#state.name.trim().length > 0;
      const hasPurpose = this.#state.purpose.trim().length > 0;
      const hasOwner = this.#state.owner.trim().length > 0;
      const hasDeployments = this.#state.deployments.length > 0;
      return hasName && hasPurpose && hasOwner && hasDeployments;
    }
    if (this.#state.step === 2) {
      if (!this.#riskWizard.isComplete) {
        return true;
      }
      if (this.#riskWizard.isEvaluating || !!this.#riskWizard.error) {
        return false;
      }
      return Boolean(this.#riskWizard.result);
    }
    return true;
  }

  async goNext(): Promise<void> {
    if (this.#state.isSubmitting) {
      return;
    }
    if (this.#state.step === 2) {
      if (!this.#riskWizard.isComplete) {
        this.#riskWizard.nextStep();
        this.#syncRiskState();
        this.#notifyStateChanged();
        return;
      }
      if (this.#riskWizard.isEvaluating || !this.#riskWizard.result || this.#riskWizard.error) {
        this.#syncRiskState();
        this.#notifyStateChanged({ persist: false });
        return;
      }
    }

    if (this.#state.step < this.steps.length - 1) {
      this.#updateState(() => {
        this.#state.step += 1;
      });
      return;
    }

    this.#setSubmitError(undefined);
    this.#setSubmitting(true);

    try {
      const requestPayload = {
        name: this.#state.name,
        role: this.#state.projectRole,
        purpose: this.#state.purpose,
        owner: this.#state.owner,
        businessUnit: this.#state.businessUnit || undefined,
        deployments: [...this.#state.deployments],
        risk: this.#state.riskResult?.classification,
        riskAssessment: this.#state.riskResult
          ? {
              classification: this.#state.riskResult.classification,
              justification: this.#state.riskResult.justification,
              answers: this.#riskWizard.answersList
            }
          : undefined
      };

      const { projectId } = await createProjectRequest(requestPayload);
      const [projectList, deliverables] = await Promise.all([
        fetchProjectsFromApi({}),
        fetchProjectDeliverablesFromApi(projectId)
      ]);

      this.#projects.value.replaceProjects(projectList.items);
      this.#projects.value.setDocumentsForProject(projectId, deliverables);
      this.#projects.value.setActiveProjectId(projectId);

      this.#clearDraft(true);
      this.#resetWizardState();
      navigateTo(`/projects/${projectId}/deliverables?wizard=schedule`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      this.#setSubmitError(message);
    } finally {
      this.#setSubmitting(false);
    }
  }

  goPrevious(): void {
    if (this.#state.step === 2 && !this.#riskWizard.isOnFirstStep) {
      this.#riskWizard.previousStep();
      this.#syncRiskState();
      this.#notifyStateChanged({ persist: false });
      return;
    }
    this.#updateState(() => {
      this.#state.step = Math.max(0, this.#state.step - 1);
    });
  }

  cancel(): void {
    this.#clearDraft(true);
    this.#resetWizardState();
    navigateTo('/projects', { replace: true });
  }

  answerBoolean(question: RiskWizardQuestion, value: boolean): void {
    this.#riskWizard.setAnswer(question.id, value);
    if (question.conditional && value !== question.conditional.on) {
      this.#riskWizard.clearAnswer(question.conditional.question.id);
    }
    this.#syncRiskState();
    this.#notifyStateChanged();
  }

  answerSelect(questionId: string, value: string): void {
    if (!value) {
      this.#riskWizard.clearAnswer(questionId);
    } else {
      this.#riskWizard.setAnswer(questionId, value);
    }
    this.#syncRiskState();
    this.#notifyStateChanged();
  }

  answerMultiselect(questionId: string, option: string, checked: boolean): void {
    const current = Array.isArray(this.#state.riskAnswers[questionId])
      ? [...(this.#state.riskAnswers[questionId] as string[])]
      : [];
    if (checked) {
      if (!current.includes(option)) {
        current.push(option);
      }
    } else {
      const index = current.indexOf(option);
      if (index >= 0) {
        current.splice(index, 1);
      }
    }
    if (current.length === 0) {
      this.#riskWizard.clearAnswer(questionId);
    } else {
      this.#riskWizard.setAnswer(questionId, current);
    }
    this.#syncRiskState();
    this.#notifyStateChanged();
  }

  answerText(questionId: string, value: string): void {
    if (!value.trim()) {
      this.#riskWizard.clearAnswer(questionId);
    } else {
      this.#riskWizard.setAnswer(questionId, value);
    }
    this.#syncRiskState();
    this.#notifyStateChanged();
  }

  #updateState(mutator: () => void, options: { persist?: boolean } = {}): void {
    mutator();
    this.#notifyStateChanged({ persist: options.persist ?? true });
  }

  #notifyStateChanged(options: { persist?: boolean } = {}): void {
    const shouldPersist = options.persist ?? true;
    this.#host.requestUpdate();
    if (shouldPersist && this.#persistenceSuspended === 0) {
      this.#persistDraft();
    }
  }

  #ensureTempProjectId(): string {
    if (!this.#tempProjectId) {
      this.#tempProjectId = this.#generateTempProjectId();
    }
    return this.#tempProjectId;
  }

  #generateTempProjectId(): string {
    return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  #syncRiskState(): void {
    this.#state.riskStepIndex = this.#riskWizard.stepIndex;
    this.#state.riskResult = this.#riskWizard.result;
    this.#state.isRiskEvaluating = this.#riskWizard.isEvaluating;
    this.#state.riskError = this.#riskWizard.error;
    this.#state.riskAnswers = this.#riskWizard.answers;
  }

  #createRiskWizard(): ProjectRiskWizardViewModel {
    const wizard = new ProjectRiskWizardViewModel();
    wizard.setOnStateChange(() => {
      this.#syncRiskState();
      this.#notifyStateChanged();
    });
    return wizard;
  }

  #withPersistenceSuspended(mutator: () => void): void {
    this.#persistenceSuspended += 1;
    try {
      mutator();
    } finally {
      this.#persistenceSuspended = Math.max(0, this.#persistenceSuspended - 1);
      this.#host.requestUpdate();
    }
  }

  #persistDraft(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const tempId = this.#ensureTempProjectId();
    const draft: ProjectWizardDraft = {
      tempProjectId: tempId,
      step: this.#state.step,
      details: {
        name: this.#state.name,
        role: this.#state.projectRole,
        purpose: this.#state.purpose,
        owner: this.#state.owner,
        businessUnit: this.#state.businessUnit,
        deployments: [...this.#state.deployments]
      },
      team: this.#state.team.map((member) => ({
        ...member,
        raci: { ...member.raci }
      })),
      pendingInvites: this.#state.pendingInvites.filter(isNonEmptyString),
      inviteEmail: this.#state.inviteEmail,
      risk: {
        stepIndex: this.#state.riskStepIndex,
        answers: { ...this.#state.riskAnswers },
        result: this.#state.riskResult ? { ...this.#state.riskResult } : undefined
      },
      notes: this.#state.notes
    };

    try {
      window.localStorage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      eventBus.emit({
        type: 'PROJECT_DRAFT_UPDATED',
        payload: { tempId, storageKey: PROJECT_DRAFT_STORAGE_KEY }
      });
    } catch (error) {
      console.warn('projects-wizard: unable to persist draft', error);
    }
  }

  #restoreDraft(): void {
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
      console.warn('projects-wizard: unable to parse stored draft', error);
      window.localStorage.removeItem(PROJECT_DRAFT_STORAGE_KEY);
      return;
    }

    if (!parsed) {
      return;
    }

    this.#withPersistenceSuspended(() => {
      if (isNonEmptyString(parsed.tempProjectId)) {
        this.#tempProjectId = parsed.tempProjectId;
      }

      this.#state.step = this.#clampStep(parsed.step);
      this.#state.name = typeof parsed.details?.name === 'string' ? parsed.details.name : '';
      const storedRole = parsed.details?.role;
      this.#state.projectRole = isProjectRole(storedRole) ? storedRole : 'provider';
      this.#state.purpose = typeof parsed.details?.purpose === 'string' ? parsed.details.purpose : '';
      this.#state.owner = typeof parsed.details?.owner === 'string' ? parsed.details.owner : '';
      this.#state.businessUnit =
        typeof parsed.details?.businessUnit === 'string' ? parsed.details.businessUnit : '';
      this.#state.deployments = Array.isArray(parsed.details?.deployments)
        ? parsed.details.deployments.filter(isDeploymentOption)
        : [];

      this.#state.team = this.#restoreTeamMembers(parsed.team);
      this.#state.pendingInvites = Array.isArray(parsed.pendingInvites)
        ? parsed.pendingInvites.filter(isNonEmptyString)
        : [];
      this.#state.inviteEmail = typeof parsed.inviteEmail === 'string' ? parsed.inviteEmail : '';
      this.#state.notes = typeof parsed.notes === 'string' ? parsed.notes : '';

      this.#restoreRiskWizard(parsed.risk);
    });
  }

  #restoreTeamMembers(raw: unknown): ProjectTeamMember[] {
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

  #restoreRiskWizard(risk?: ProjectWizardDraft['risk']): void {
    this.#riskWizard = this.#createRiskWizard();
    if (!risk || typeof risk !== 'object') {
      this.#syncRiskState();
      return;
    }

    const answers = risk.answers && typeof risk.answers === 'object' ? risk.answers : {};
    for (const [questionId, value] of Object.entries(answers)) {
      this.#riskWizard.setAnswer(questionId, value);
    }

    const targetStep = this.#clampRiskStep(risk.stepIndex);
    while (this.#riskWizard.stepIndex < targetStep && !this.#riskWizard.isComplete) {
      this.#riskWizard.nextStep();
    }

    this.#syncRiskState();
  }

  #clampStep(step: unknown): number {
    const numeric = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 0;
    const max = this.steps.length - 1;
    return Math.min(Math.max(0, numeric), max);
  }

  #clampRiskStep(step: unknown): number {
    const numeric = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 0;
    const max = this.#riskWizard.steps.length - 1;
    return Math.min(Math.max(0, numeric), max);
  }

  #clearDraft(notifySyncAgent: boolean): void {
    const previousTempId = this.#tempProjectId;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(PROJECT_DRAFT_STORAGE_KEY);
      } catch (error) {
        console.warn('projects-wizard: unable to clear stored draft', error);
      }
    }
    this.#tempProjectId = null;

    if (notifySyncAgent && previousTempId) {
      eventBus.emit({
        type: 'PROJECT_DRAFT_CLEARED',
        payload: { tempId: previousTempId, storageKey: PROJECT_DRAFT_STORAGE_KEY }
      });
    }
  }

  #resetWizardState(): void {
    this.#withPersistenceSuspended(() => {
      this.#state = {
        step: 0,
        name: '',
        projectRole: 'provider',
        purpose: '',
        owner: '',
        businessUnit: '',
        deployments: [],
        team: [],
        pendingInvites: [],
        inviteEmail: '',
        riskStepIndex: 0,
        riskResult: undefined,
        isRiskEvaluating: false,
        riskError: undefined,
        riskAnswers: {},
        notes: '',
        isSubmitting: false,
        submitError: undefined,
      };
      this.#riskWizard = this.#createRiskWizard();
      this.#syncRiskState();
    });
  }

  #setSubmitting(value: boolean): void {
    if (this.#state.isSubmitting === value) {
      return;
    }
    this.#updateState(() => {
      this.#state.isSubmitting = value;
    }, { persist: false });
  }

  #setSubmitError(message: string | undefined): void {
    if (this.#state.submitError === message) {
      return;
    }
    this.#updateState(() => {
      this.#state.submitError = message;
    }, { persist: false });
  }
}
