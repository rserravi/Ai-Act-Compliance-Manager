import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { AISystem, ProjectTeamMember } from '../../domain/models';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import { infoCircleIcon } from '../../shared/icons';
import { ProjectsWizardViewModel } from './projects-wizard.viewmodel';
import {
  DEPLOYMENT_OPTIONS,
  type DeploymentOption,
  type RiskWizardHelp,
  type RiskWizardQuestion
} from './Model';
import type { TeamMemberFormSubmitDetail } from './team-member-form';
import './team-member-form';

@customElement('projects-wizard-page')
export class ProjectsWizardPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  #viewModel = new ProjectsWizardViewModel(this);

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private get steps(): string[] {
    return this.#viewModel.steps.map((stepId) =>
      t(`projects.wizard.steps.${stepId}` as const)
    );
  }

  private renderStepIndicator() {
    return html`
      <ul class="steps">
        ${this.steps.map((label, index) => html`
          <li class="step ${index <= this.#viewModel.step ? 'step-primary' : ''}">${label}</li>
        `)}
      </ul>
    `;
  }

  private handleNameChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.#viewModel.setName(input.value);
  }

  private handlePurposeChange(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.#viewModel.setPurpose(textarea.value);
  }

  private handleOwnerChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.#viewModel.setOwner(input.value);
  }

  private handleBusinessUnitChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.#viewModel.setBusinessUnit(input.value);
  }

  private handleRoleChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    this.#viewModel.setProjectRole(select.value as AISystem['role']);
  }

  private handleDeploymentToggle(option: DeploymentOption, event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.#viewModel.toggleDeployment(option, input.checked);
  }

  private renderDetailsStep() {
    return html`
      <div class="grid gap-4 md:grid-cols-2">
        <label class="form-control">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.name')}</span></span>
          <input
            class="input input-bordered"
            .value=${this.#viewModel.name}
            @input=${this.handleNameChange}
            @change=${this.handleNameChange}
            required
          >
        </label>
        <label class="form-control">
          <span class="label"><span class="label-text">${t('projects.wizard.fields.role')}</span></span>
          <select
            class="select select-bordered"
            .value=${this.#viewModel.projectRole}
            @change=${this.handleRoleChange}
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
            .value=${this.#viewModel.purpose}
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
            .value=${this.#viewModel.owner}
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
            .value=${this.#viewModel.businessUnit}
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
              const selected = this.#viewModel.deployments.includes(option);
              return html`
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    class="checkbox checkbox-sm"
                    type="checkbox"
                    .checked=${selected}
                    @change=${(event: Event) => this.handleDeploymentToggle(option, event)}
                  >
                  <span>${t(`projects.wizard.deployments.options.${option}` as const)}</span>
                </label>
              `;
            })}
          </div>
          ${this.#viewModel.deployments.length === 0
            ? html`<span class="mt-2 text-sm text-error">${t('projects.wizard.validations.deployments')}</span>`
            : null}
        </label>
      </div>
    `;
  }

  private handleMemberAdded(event: CustomEvent<TeamMemberFormSubmitDetail>) {
    this.#viewModel.addTeamMember(event.detail);
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
      ${labels.map((label) => html`<span class="badge badge-outline">${t(label)}</span>`)}
    </div>`;
  }

  private renderTeamTable() {
    const team = this.#viewModel.team;
    return html`
      <div class="card border border-base-300 shadow-sm">
        <div class="card-body space-y-4">
          <header class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-lg font-semibold">${t('projects.wizard.fields.team')}</h3>
            <span class="badge badge-neutral">${t('projects.wizard.summary.teamCount', { count: team.length })}</span>
          </header>
          ${team.length === 0
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
                      ${team.map(
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
                                @click=${() => this.#viewModel.removeTeamMember(member.id)}
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

  private handleInviteInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    this.#viewModel.setInviteEmail(input.value);
  }

  private handleInviteSubmit(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) {
      return;
    }
    this.#viewModel.addPendingInvite();
  }

  private renderPendingInvitesSection() {
    const pendingInvites = this.#viewModel.pendingInvites;
    return html`
      <div class="card border border-base-300 shadow-sm">
        <div class="card-body space-y-4">
          <header>
            <h3 class="text-lg font-semibold">${t('projects.wizard.team.invites.title')}</h3>
            <p class="text-sm text-base-content/70">${t('projects.wizard.team.invites.description')}</p>
          </header>
          <form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" @submit=${this.handleInviteSubmit}>
            <label class="form-control">
              <span class="label"><span class="label-text">${t('projects.wizard.contact.email')}</span></span>
              <input
                class="input input-bordered"
                type="email"
                .value=${this.#viewModel.inviteEmail}
                required
                placeholder=${t('projects.wizard.team.invites.placeholder')}
                @input=${this.handleInviteInput}
              >
            </label>
            <div class="flex items-end">
              <button class="btn btn-sm" type="submit">${t('projects.wizard.team.invites.add')}</button>
            </div>
          </form>
          ${pendingInvites.length === 0
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
                      ${pendingInvites.map(
                        (email) => html`
                          <tr>
                            <td>${email}</td>
                            <td><span class="badge badge-outline">${t('projects.wizard.team.invites.pending')}</span></td>
                            <td>
                              <button
                                type="button"
                                class="btn btn-ghost btn-xs"
                                @click=${() => this.#viewModel.removePendingInvite(email)}
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

  private renderTeamStep() {
    return html`
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <team-member-form @member-added=${(event: CustomEvent<TeamMemberFormSubmitDetail>) => this.handleMemberAdded(event)}></team-member-form>
        <div class="space-y-6">
          ${this.renderTeamTable()}
          ${this.renderPendingInvitesSection()}
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
    const answer = this.#viewModel.riskAnswers[question.id];
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
                  @change=${() => this.#viewModel.answerBoolean(question, true)}
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
                  @change=${() => this.#viewModel.answerBoolean(question, false)}
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
                this.#viewModel.answerSelect(question.id, select.value);
              }}
            >
              <option value="">${t('riskWizard.form.selectPlaceholder')}</option>
              ${(question.options ?? []).map((option) => html`<option value=${option}>${option}</option>`)}
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
                        this.#viewModel.answerMultiselect(question.id, option, input.checked);
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
                this.#viewModel.answerText(question.id, textarea.value);
              }}
            ></textarea>
          </label>
        `;
    }
  }

  private renderRiskResult() {
    const result = this.#viewModel.riskResult;
    if (!result) {
      return null;
    }
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
          .value=${this.#viewModel.notes}
          placeholder=${t('projects.wizard.placeholders.notes')}
          @input=${(event: Event) => {
            const textarea = event.currentTarget as HTMLTextAreaElement;
            this.#viewModel.setNotes(textarea.value);
          }}
        ></textarea>
      </label>
    `;
  }

  private renderRiskStep() {
    const steps = this.#viewModel.riskSteps;
    const currentStep = this.#viewModel.currentRiskStep;
    const isResultStep = Boolean(currentStep.rules && currentStep.default);

    return html`
      <div class="space-y-6">
        <div class="overflow-x-auto">
          <ul class="steps steps-vertical md:steps-horizontal">
            ${steps.map(
              (step, index) => html`<li class="step ${index <= this.#viewModel.riskStepIndex ? 'step-primary' : ''}">${
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

  private renderSummaryStep() {
    const riskResult = this.#viewModel.riskResult;
    return html`
      <div class="space-y-4">
        <article class="prose">
          <h2>${t('projects.wizard.summary.title')}</h2>
          <p><strong>${t('projects.wizard.fields.name')}:</strong> ${this.#viewModel.name}</p>
          <p><strong>${t('projects.wizard.fields.role')}:</strong> ${t(`roles.${this.#viewModel.projectRole}` as const)}</p>
          <p><strong>${t('projects.wizard.fields.purpose')}:</strong> ${
            this.#viewModel.purpose || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.owner')}:</strong> ${
            this.#viewModel.owner || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.businessUnit')}:</strong> ${
            this.#viewModel.businessUnit || t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.deployments')}:</strong> ${
            this.#viewModel.deployments.length
              ? this.#viewModel.deployments
                  .map((deployment) => t(`projects.wizard.deployments.options.${deployment}` as const))
                  .join(', ')
              : t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.fields.risk')}:</strong> ${
            riskResult ? t(`riskLevels.${riskResult.classification}` as const) : t('projects.wizard.summary.unclassifiedRisk')
          }</p>
          <p><strong>${t('projects.wizard.summary.justification')}:</strong> ${
            riskResult?.justification ?? t('projects.wizard.summary.unset')
          }</p>
          <p><strong>${t('projects.wizard.summary.contacts')}:</strong> ${t(
            'projects.wizard.summary.teamCount',
            { count: this.#viewModel.team.length }
          )}</p>
          <p><strong>${t('projects.wizard.team.invites.summaryLabel')}:</strong> ${
            this.#viewModel.pendingInvites.length
              ? t('projects.wizard.team.invites.summary', { count: this.#viewModel.pendingInvites.length })
              : t('projects.wizard.team.invites.empty')
          }</p>
          <p><strong>${t('projects.wizard.fields.notes')}:</strong> ${
            this.#viewModel.notes || t('projects.wizard.summary.noNotes')
          }</p>
        </article>
      </div>
    `;
  }

  private renderCurrentStep() {
    switch (this.#viewModel.step) {
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

  private handleCancel = () => {
    this.#viewModel.cancel();
  };

  private handlePrevious = () => {
    this.#viewModel.goPrevious();
  };

  private handleNext = () => {
    this.#viewModel.goNext();
  };

  private canContinueToNextStep(): boolean {
    return this.#viewModel.canContinueToNextStep();
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
                <button class="btn btn-ghost" type="button" @click=${this.handleCancel}>
                  ${t('common.cancel')}
                </button>
                <button class="btn" type="button" ?disabled=${this.#viewModel.step === 0} @click=${this.handlePrevious}>
                  ${t('common.back')}
                </button>
              </div>
              <button class="btn btn-primary" type="button" ?disabled=${!canContinue} @click=${this.handleNext}>
                ${this.#viewModel.step === this.#viewModel.steps.length - 1
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
