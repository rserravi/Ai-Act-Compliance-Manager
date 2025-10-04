import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { AISystem } from '../../domain/models';
import type { Contact } from '../../domain/models';
import { navigateTo } from '../../navigation';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';
import { infoCircleIcon } from '../../shared/icons';
import {
  ProjectRiskWizardViewModel,
  type RiskWizardQuestion,
  type RiskWizardResult,
  type RiskWizardHelp
} from './ProjectRiskWizard.viewmodel';

@customElement('projects-wizard-page')
export class ProjectsWizardPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);
  private readonly riskWizard = new ProjectRiskWizardViewModel();

  @state() private step = 0;
  @state() private name = '';
  @state() private projectRole: AISystem['role'] = 'provider';
  @state() private businessUnit = '';
  @state() private team: Contact[] = [];
  @state() private riskStepIndex = this.riskWizard.stepIndex;
  @state() private riskResult: RiskWizardResult = this.riskWizard.result;
  @state() private riskAnswers: Record<string, unknown> = this.riskWizard.answers;
  @state() private notes = '';

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

  private addTeamMember() {
    const name = prompt(t('projects.wizard.contact.name'));
    if (!name) return;
    const role = prompt(t('projects.wizard.contact.role')) ?? '';
    const email = prompt(t('projects.wizard.contact.email')) ?? '';
    const member: Contact = {
      id: `contact-${Date.now()}`,
      name,
      role,
      email,
      phone: '',
      notification: 'email'
    };
    this.team = [...this.team, member];
  }

  private removeTeamMember(id: string) {
    this.team = this.team.filter((member) => member.id !== id);
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
      team: this.team,
      businessUnit: this.businessUnit,
      risk: result?.classification,
      riskAssessment: result
        ? {
            classification: result.classification,
            justification: result.justification,
            answers: this.riskWizard.answersList
          }
        : undefined
    });
    this.notes = '';
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
            @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.name = input.value;
            }}
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
          <span class="label"><span class="label-text">${t('projects.wizard.fields.businessUnit')}</span></span>
          <input
            class="input input-bordered"
            .value=${this.businessUnit}
            @input=${(event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              this.businessUnit = input.value;
            }}
            placeholder=${t('projects.wizard.placeholders.businessUnit')}
          >
        </label>
      </div>
    `;
  }

  private renderTeamStep() {
    return html`
      <div class="space-y-4">
        <button class="btn btn-sm" @click=${this.addTeamMember}>${t('projects.wizard.addContact')}</button>
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.team.map((member) => html`
                      <tr>
                        <td>${member.name}</td>
                        <td>${member.role}</td>
                        <td>${member.email}</td>
                        <td>
                          <button class="btn btn-ghost btn-xs" @click=${() => this.removeTeamMember(member.id)}>
                            ${t('common.remove')}
                          </button>
                        </td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            `}
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
          <p><strong>${t('projects.wizard.fields.businessUnit')}:</strong> ${
            this.businessUnit || t('projects.wizard.summary.unset')
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

  protected render() {
    const canContinue = this.step === 0 ? this.name.trim().length > 0 : true;

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
            <div class="flex justify-between">
              <button class="btn" ?disabled=${this.step === 0} @click=${this.prevStep}>
                ${t('common.back')}
              </button>
              <button class="btn btn-primary" ?disabled=${!canContinue} @click=${this.nextStep}>
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
