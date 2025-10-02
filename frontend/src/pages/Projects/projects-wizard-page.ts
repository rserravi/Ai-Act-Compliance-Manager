import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { AISystem } from '../../domain/models';
import type { Contact } from '../../domain/models';
import { navigateTo } from '../../navigation';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

@customElement('projects-wizard-page')
export class ProjectsWizardPage extends LocalizedElement {
  declare renderRoot: HTMLElement;

  private readonly projects = new ProjectController(this);

  @state() private step = 0;
  @state() private name = '';
  @state() private projectRole: AISystem['role'] = 'provider';
  @state() private businessUnit = '';
  @state() private team: Contact[] = [];
  @state() private risk: AISystem['risk'] | undefined;
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
    if (this.step < this.steps.length - 1) {
      this.step += 1;
    } else {
      const project = this.projects.value.createProject({
        name: this.name,
        role: this.projectRole,
        risk: this.risk,
        team: this.team,
        businessUnit: this.businessUnit
      });
      this.notes = '';
      navigateTo(`/projects/${project.id}/deliverables`, { replace: true });
    }
  }

  private prevStep() {
    this.step = Math.max(0, this.step - 1);
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
    return html`
      <div class="space-y-4">
        <p class="text-sm text-base-content/70">${t('projects.wizard.risk.description')}</p>
        <div class="join join-vertical md:join-horizontal">
          ${(['alto', 'limitado', 'minimo'] as const).map((value) => html`
            <button
              class="btn join-item ${this.risk === value ? 'btn-primary' : 'btn-outline'}"
              @click=${() => {
                this.risk = value as AISystem['risk'];
              }}
            >
              ${t('projects.wizard.risk.option', {
                risk: t(`riskLevels.${value}` as const)
              })}
            </button>
          `)}
        </div>
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
      </div>
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
            this.risk ? t(`riskLevels.${this.risk}` as const) : t('projects.wizard.summary.unclassifiedRisk')
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
    const canContinue =
      this.step === 0 ? this.name.trim().length > 0 : this.step === 2 ? Boolean(this.risk) : true;

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
