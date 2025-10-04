import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import type { RaciMatrix } from '../../domain/models';
import { LocalizedElement } from '../../shared/localized-element';
import { t } from '../../shared/i18n';

export interface TeamMemberFormSubmitDetail {
  name: string;
  email: string;
  role: string;
  raci: RaciMatrix;
  isOwner: boolean;
  isReviewer: boolean;
}

@customElement('team-member-form')
export class TeamMemberForm extends LocalizedElement {
  @state() private name = '';
  @state() private email = '';
  @state() private memberRole = '';
  @state() private raci: RaciMatrix = {
    responsible: false,
    accountable: false,
    consulted: false,
    informed: false
  };
  @state() private isOwner = false;
  @state() private isReviewer = false;

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  private resetForm() {
    this.name = '';
    this.email = '';
    this.memberRole = '';
    this.raci = {
      responsible: false,
      accountable: false,
      consulted: false,
      informed: false
    };
    this.isOwner = false;
    this.isReviewer = false;
    const form = this.renderRoot.querySelector('form');
    form?.reset();
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) {
      return;
    }

    const detail: TeamMemberFormSubmitDetail = {
      name: this.name.trim(),
      email: this.email.trim(),
      role: this.memberRole.trim(),
      raci: { ...this.raci },
      isOwner: this.isOwner,
      isReviewer: this.isReviewer
    };

    this.dispatchEvent(
      new CustomEvent<TeamMemberFormSubmitDetail>('member-added', {
        detail,
        bubbles: true,
        composed: true
      })
    );

    this.resetForm();
  }

  private handleRaciToggle(key: keyof RaciMatrix, checked: boolean) {
    this.raci = { ...this.raci, [key]: checked };
  }

  override render() {
    return html`
      <form class="card border border-base-300 bg-base-200/50 shadow-sm" @submit=${this.handleSubmit}>
        <div class="card-body space-y-4">
          <header>
            <h3 class="text-lg font-semibold">${t('projects.wizard.team.form.title')}</h3>
            <p class="text-sm text-base-content/70">${t('projects.wizard.team.form.description')}</p>
          </header>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="form-control">
              <span class="label"><span class="label-text">${t('projects.wizard.contact.name')}</span></span>
              <input
                class="input input-bordered"
                type="text"
                .value=${this.name}
                required
                @input=${(event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  this.name = input.value;
                }}
              />
            </label>
            <label class="form-control">
              <span class="label"><span class="label-text">${t('projects.wizard.contact.email')}</span></span>
              <input
                class="input input-bordered"
                type="email"
                .value=${this.email}
                required
                @input=${(event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  this.email = input.value;
                }}
              />
            </label>
            <label class="form-control md:col-span-2">
              <span class="label"><span class="label-text">${t('projects.wizard.contact.role')}</span></span>
              <input
                class="input input-bordered"
                type="text"
                .value=${this.memberRole}
                required
                @input=${(event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  this.memberRole = input.value;
                }}
              />
            </label>
          </div>
          <fieldset class="space-y-2">
            <legend class="label">
              <span class="label-text">${t('projects.wizard.team.form.raciTitle')}</span>
              <span class="label-text-alt">${t('projects.wizard.team.form.raciHelper')}</span>
            </legend>
            <div class="flex flex-wrap gap-3">
              ${(
                [
                  ['responsible', 'projects.wizard.team.raci.responsible'] as const,
                  ['accountable', 'projects.wizard.team.raci.accountable'] as const,
                  ['consulted', 'projects.wizard.team.raci.consulted'] as const,
                  ['informed', 'projects.wizard.team.raci.informed'] as const
                ] satisfies Array<[keyof RaciMatrix, string]>
              ).map(([key, label]) => {
                const checked = this.raci[key];
                return html`
                  <label class="label cursor-pointer gap-2">
                    <input
                      class="checkbox checkbox-sm"
                      type="checkbox"
                      .checked=${checked}
                      @change=${(event: Event) => {
                        const input = event.currentTarget as HTMLInputElement;
                        this.handleRaciToggle(key, input.checked);
                      }}
                    />
                    <span>${t(label as Parameters<typeof t>[0])}</span>
                  </label>
                `;
              })}
            </div>
          </fieldset>
          <div class="flex flex-wrap gap-4">
            <label class="label cursor-pointer gap-2">
              <span>${t('projects.wizard.team.form.owner')}</span>
              <input
                class="checkbox checkbox-sm"
                type="checkbox"
                .checked=${this.isOwner}
                @change=${(event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  this.isOwner = input.checked;
                }}
              />
            </label>
            <label class="label cursor-pointer gap-2">
              <span>${t('projects.wizard.team.form.reviewer')}</span>
              <input
                class="checkbox checkbox-sm"
                type="checkbox"
                .checked=${this.isReviewer}
                @change=${(event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  this.isReviewer = input.checked;
                }}
              />
            </label>
          </div>
          <div class="card-actions justify-end">
            <button class="btn btn-primary btn-sm" type="submit">${t('projects.wizard.team.form.submit')}</button>
          </div>
        </div>
      </form>
    `;
  }
}
