import riskWizardConfig from '../../configs/risk-wizard.json';
import type { RiskAnswer } from '../../domain/models';
import type {
  RiskWizardQuestion,
  RiskWizardRuleConditionValue,
  RiskWizardResult,
  RiskWizardStep
} from './Model';

type RiskWizardState = {
  stepIndex: number;
  answers: Record<string, unknown>;
  result: RiskWizardResult;
};

const wizardDefinition = riskWizardConfig.wizard;

function isNonEmpty(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return Boolean(value);
}

export class ProjectRiskWizardViewModel {
  readonly steps: RiskWizardStep[];
  #state: RiskWizardState;
  constructor() {
    this.steps = wizardDefinition.steps as RiskWizardStep[];
    const answers: Record<string, unknown> = {};
    const result = this.#evaluate(answers);
    this.#state = {
      stepIndex: 0,
      answers,
      result
    };
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

  get result(): RiskWizardResult {
    return this.#state.result;
  }

  nextStep(): void {
    if (this.#state.stepIndex >= this.steps.length - 1) {
      return;
    }
    this.#state = {
      ...this.#state,
      stepIndex: this.#state.stepIndex + 1,
      result: this.#evaluate()
    };
  }

  previousStep(): void {
    if (this.#state.stepIndex <= 0) {
      return;
    }
    this.#state = {
      ...this.#state,
      stepIndex: this.#state.stepIndex - 1,
      result: this.#evaluate()
    };
  }

  setAnswer(questionId: string, value: unknown): void {
    this.#state = {
      ...this.#state,
      answers: { ...this.#state.answers, [questionId]: value },
      result: this.#evaluate({ ...this.#state.answers, [questionId]: value })
    };
  }

  clearAnswer(questionId: string): void {
    if (!(questionId in this.#state.answers)) return;
    const { [questionId]: _removed, ...rest } = this.#state.answers;
    this.#state = {
      ...this.#state,
      answers: rest,
      result: this.#evaluate(rest)
    };
  }

  #evaluate(answers: Record<string, unknown> = this.#state.answers): RiskWizardResult {
    const resultStep = this.steps.find((step) => step.rules && step.default);
    if (!resultStep || !resultStep.rules || !resultStep.default) {
      return { classification: 'limitado', justification: '' };
    }

    for (const rule of resultStep.rules) {
      if (this.#matchesRule(rule.if, answers)) {
        return { classification: rule.classification, justification: rule.justification };
      }
    }

    return resultStep.default;
  }

  #matchesRule(conditions: Record<string, RiskWizardRuleConditionValue>, answers: Record<string, unknown>): boolean {
    return Object.entries(conditions).every(([questionId, expected]) => {
      const answer = answers[questionId];
      if (expected === 'not_empty') {
        return isNonEmpty(answer);
      }
      if (Array.isArray(expected)) {
        if (Array.isArray(answer)) {
          return expected.some((value) => answer.includes(value));
        }
        return expected.includes(answer as string);
      }
      return answer === expected;
    });
  }
}

export type RiskWizardDefinition = typeof wizardDefinition;
