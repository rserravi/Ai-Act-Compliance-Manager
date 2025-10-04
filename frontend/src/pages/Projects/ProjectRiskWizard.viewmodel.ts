import riskWizardConfig from '../../configs/risk-wizard.json';
import type { RiskAnswer } from '../../domain/models';
import { RiskEvaluationService } from './Service/risk-evaluation.service';
import type { RiskWizardResult, RiskWizardStep } from './Model';

type RiskWizardState = {
  stepIndex: number;
  answers: Record<string, unknown>;
  result?: RiskWizardResult;
  isEvaluating: boolean;
  error?: string;
};

const wizardDefinition = riskWizardConfig.wizard;

type StateChangeListener = () => void;

export class ProjectRiskWizardViewModel {
  readonly steps: RiskWizardStep[];
  #state: RiskWizardState;
  #service = new RiskEvaluationService();
  #onChange?: StateChangeListener;
  #evaluationToken = 0;
  constructor() {
    this.steps = wizardDefinition.steps as RiskWizardStep[];
    this.#state = {
      stepIndex: 0,
      answers: {},
      result: undefined,
      isEvaluating: false,
      error: undefined
    };
  }

  setOnStateChange(listener: StateChangeListener | undefined): void {
    this.#onChange = listener;
  }

  get stepIndex(): number {
    return this.#state.stepIndex;
  }

  get isOnFirstStep(): boolean {
    return this.#state.stepIndex === 0;
  }

  get isComplete(): boolean {
    return this.#state.stepIndex >= this.steps.length - 1;
  }

  get currentStep(): RiskWizardStep {
    return this.steps[this.#state.stepIndex];
  }

  get answers(): Record<string, unknown> {
    return { ...this.#state.answers };
  }

  get answersList(): RiskAnswer[] {
    return Object.entries(this.#state.answers).map(([key, value]) => ({ key, value }));
  }

  get result(): RiskWizardResult | undefined {
    return this.#state.result;
  }

  get isEvaluating(): boolean {
    return this.#state.isEvaluating;
  }

  get error(): string | undefined {
    return this.#state.error;
  }

  nextStep(): void {
    if (this.#state.stepIndex >= this.steps.length - 1) {
      return;
    }
    this.#state = {
      ...this.#state,
      stepIndex: this.#state.stepIndex + 1
    };
    if (this.isComplete) {
      this.#requestEvaluation();
    }
  }

  previousStep(): void {
    if (this.#state.stepIndex <= 0) {
      return;
    }
    this.#state = {
      ...this.#state,
      stepIndex: this.#state.stepIndex - 1
    };
  }

  setAnswer(questionId: string, value: unknown): void {
    this.#state = {
      ...this.#state,
      answers: { ...this.#state.answers, [questionId]: value },
      result: this.#state.result,
      error: undefined
    };
    this.#resetEvaluationState();
    if (this.isComplete) {
      this.#requestEvaluation();
    }
  }

  clearAnswer(questionId: string): void {
    if (!(questionId in this.#state.answers)) return;
    const { [questionId]: _removed, ...rest } = this.#state.answers;
    this.#state = {
      ...this.#state,
      answers: rest,
      result: this.#state.result,
      error: undefined
    };
    this.#resetEvaluationState();
    if (this.isComplete) {
      this.#requestEvaluation();
    }
  }

  retryEvaluation(): void {
    if (this.isComplete) {
      this.#requestEvaluation();
    }
  }

  #resetEvaluationState(): void {
    this.#evaluationToken += 1;
    this.#state = {
      ...this.#state,
      result: undefined,
      isEvaluating: false,
      error: undefined
    };
  }

  async #requestEvaluation(): Promise<void> {
    const answers = { ...this.#state.answers };
    const token = ++this.#evaluationToken;
    this.#state = {
      ...this.#state,
      isEvaluating: true,
      error: undefined
    };
    this.#notifyStateChanged();

    try {
      const result = await this.#service.evaluate({ answers });
      if (token !== this.#evaluationToken) {
        return;
      }
      this.#state = {
        ...this.#state,
        result,
        isEvaluating: false
      };
      this.#notifyStateChanged();
    } catch (error) {
      if (token !== this.#evaluationToken) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to evaluate risk';
      this.#state = {
        ...this.#state,
        isEvaluating: false,
        error: message
      };
      this.#notifyStateChanged();
    }
  }

  #notifyStateChanged(): void {
    this.#onChange?.();
  }
}

export type RiskWizardDefinition = typeof wizardDefinition;
