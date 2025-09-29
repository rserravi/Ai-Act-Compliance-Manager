import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ProjectController } from '../../state/controllers';
import type { AISystem } from '../../domain/models';
import type { Contact } from '../../domain/models';
import { navigateTo } from '../../navigation';

@customElement('projects-wizard-page')
export class ProjectsWizardPage extends LitElement {
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
    return ['Detalles', 'Equipo', 'Riesgo', 'Resumen'];
  }

  private addTeamMember() {
    const name = prompt('Nombre del contacto');
    if (!name) return;
    const role = prompt('Rol en el proyecto') ?? '';
    const email = prompt('Correo de contacto') ?? '';
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
          <span class="label"><span class="label-text">Nombre del proyecto</span></span>
          <input class="input input-bordered" .value=${this.name} @input=${(event: Event) => {
            const input = event.currentTarget as HTMLInputElement;
            this.name = input.value;
          }} required>
        </label>
        <label class="form-control">
          <span class="label"><span class="label-text">Rol</span></span>
          <select class="select select-bordered" .value=${this.projectRole} @change=${(event: Event) => {
            const select = event.currentTarget as HTMLSelectElement;
            this.projectRole = select.value as AISystem['role'];
          }}>
            <option value="provider">Proveedor</option>
            <option value="importer">Importador</option>
            <option value="distributor">Distribuidor</option>
            <option value="user">Usuario</option>
          </select>
        </label>
        <label class="form-control md:col-span-2">
          <span class="label"><span class="label-text">Unidad de negocio</span></span>
          <input class="input input-bordered" .value=${this.businessUnit} @input=${(event: Event) => {
            const input = event.currentTarget as HTMLInputElement;
            this.businessUnit = input.value;
          }}>
        </label>
      </div>
    `;
  }

  private renderTeamStep() {
    return html`
      <div class="space-y-4">
        <button class="btn btn-sm" @click=${this.addTeamMember}>Añadir contacto</button>
        ${this.team.length === 0
          ? html`<p class="text-sm text-base-content/70">Todavía no hay contactos asignados.</p>`
          : html`
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Correo</th>
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
                          <button class="btn btn-ghost btn-xs" @click=${() => this.removeTeamMember(member.id)}>Eliminar</button>
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
        <p class="text-sm text-base-content/70">
          Selecciona la clasificación de riesgo identificada tras la evaluación inicial.
        </p>
        <div class="join join-vertical md:join-horizontal">
          ${['alto', 'limitado', 'minimo'].map((value) => html`
            <button
              class="btn join-item ${this.risk === value ? 'btn-primary' : 'btn-outline'}"
              @click=${() => {
                this.risk = value as AISystem['risk'];
              }}
            >
              Riesgo ${value}
            </button>
          `)}
        </div>
        <label class="form-control">
          <span class="label"><span class="label-text">Notas adicionales</span></span>
          <textarea class="textarea textarea-bordered" rows="4" .value=${this.notes} @input=${(event: Event) => {
            const textarea = event.currentTarget as HTMLTextAreaElement;
            this.notes = textarea.value;
          }}></textarea>
        </label>
      </div>
    `;
  }

  private renderSummaryStep() {
    return html`
      <div class="space-y-4">
        <article class="prose">
          <h2>Resumen</h2>
          <p><strong>Nombre:</strong> ${this.name}</p>
          <p><strong>Rol:</strong> ${this.projectRole}</p>
          <p><strong>Unidad:</strong> ${this.businessUnit || 'No definida'}</p>
          <p><strong>Riesgo:</strong> ${this.risk ?? 'Sin clasificar'}</p>
          <p><strong>Contactos:</strong> ${this.team.length}</p>
          <p><strong>Notas:</strong> ${this.notes || 'Sin notas'}</p>
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
          <h1 class="text-3xl font-bold">Nuevo proyecto</h1>
          <p class="text-base-content/70">Recorre los pasos para crear un proyecto y registrar sus datos básicos.</p>
        </header>

        ${this.renderStepIndicator()}

        <div class="card bg-base-100 shadow">
          <div class="card-body space-y-6">
            ${this.renderCurrentStep()}
            <div class="flex justify-between">
              <button class="btn" ?disabled=${this.step === 0} @click=${this.prevStep}>Atrás</button>
              <button class="btn btn-primary" ?disabled=${!canContinue} @click=${this.nextStep}>
                ${this.step === this.steps.length - 1 ? 'Crear proyecto' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
