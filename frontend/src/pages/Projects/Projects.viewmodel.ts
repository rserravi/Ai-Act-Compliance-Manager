import type { AISystem } from '../../domain/models';
import { t } from '../../shared/i18n';

export type ProjectState = 'initial' | 'in_progress' | 'maintenance';

export type ProjectRow = AISystem & {
  projectState: ProjectState;
};

export const ROLE_FILTER_VALUES = ['', 'provider', 'importer', 'distributor', 'user'] as const;
export const RISK_FILTER_VALUES = ['', 'alto', 'limitado', 'minimo'] as const;
export const DOC_FILTER_VALUES = ['', 'vigente', 'borrador', 'obsoleta', 'na'] as const;

export function resolveProjectState(system: AISystem): ProjectState {
  if (!system.docStatus || system.docStatus === 'na') return 'initial';
  if (system.docStatus === 'vigente') return 'maintenance';
  return 'in_progress';
}

export function mapProjectsToRows(projects: AISystem[]): ProjectRow[] {
  return projects.map((project) => ({
    ...project,
    projectState: resolveProjectState(project)
  }));
}

export function getProjectStateLabel(state: ProjectState): string {
  return t(`projects.state.labels.${state}` as const);
}
