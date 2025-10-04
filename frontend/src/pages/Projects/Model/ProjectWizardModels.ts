import type { AISystem, ProjectTeamMember, RiskLevel } from '../../../domain/models';

export const DEPLOYMENT_OPTIONS = ['sandbox', 'pilot', 'production', 'internal_only'] as const;
export type DeploymentOption = (typeof DEPLOYMENT_OPTIONS)[number];

export const PROJECT_ROLE_OPTIONS = ['provider', 'importer', 'distributor', 'user'] as const;

export type RiskWizardQuestionType = 'boolean' | 'select' | 'multiselect' | 'text';

export type RiskWizardQuestion = {
  id: string;
  text: string;
  type: RiskWizardQuestionType;
  options?: string[];
  conditional?: {
    on: unknown;
    question: RiskWizardQuestion;
  };
};

export type RiskWizardHelpLink = {
  title: string;
  url: string;
};

export type RiskWizardHelp = {
  text: string;
  links?: RiskWizardHelpLink[];
};

export type RiskWizardRuleConditionValue = 'not_empty' | string | string[];

export type RiskWizardRule = {
  if: Record<string, RiskWizardRuleConditionValue>;
  classification: RiskLevel;
  justification: string;
};

export type RiskWizardResult = {
  classification: RiskLevel;
  justification: string;
  obligations: string[];
};

export type RiskWizardStep = {
  id: string;
  title: string;
  help?: RiskWizardHelp;
  questions?: RiskWizardQuestion[];
  rules?: RiskWizardRule[];
  default?: RiskWizardResult;
};

export type ProjectWizardDetails = {
  name: string;
  role: AISystem['role'];
  purpose: string;
  owner: string;
  businessUnit: string;
  deployments: DeploymentOption[];
};

export type ProjectWizardRiskState = {
  stepIndex: number;
  answers: Record<string, unknown>;
  result?: RiskWizardResult;
};

export type ProjectWizardDraft = {
  tempProjectId: string;
  step: number;
  details: ProjectWizardDetails;
  team: ProjectTeamMember[];
  pendingInvites: string[];
  inviteEmail?: string;
  risk: ProjectWizardRiskState;
  notes: string;
};

export interface ProjectFilter {
  role?: string;
  risk?: string;
  doc?: string;
  q?: string;
}
