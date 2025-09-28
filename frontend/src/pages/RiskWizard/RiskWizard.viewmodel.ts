export type RiskWizardState = {
  step: number;
  answers: Record<string, unknown>;
};

export class RiskWizardViewModel {
  private state: RiskWizardState = { step: 0, answers: {} };
  private readonly finalStep = 6;

  get value(): RiskWizardState {
    return { ...this.state, answers: { ...this.state.answers } };
  }

  next(): void {
    this.state.step = Math.min(this.state.step + 1, this.finalStep);
  }

  back(): void {
    this.state.step = Math.max(this.state.step - 1, 0);
  }

  setAnswer(key: string, value: unknown): void {
    this.state.answers = { ...this.state.answers, [key]: value };
  }

  get result() {
    if (this.state.step < this.finalStep) {
      return null;
    }
    return {
      classification: 'alto',
      justification: 'Coincide con Anexo III: empleo/credit scoring'
    } as const;
  }
}
