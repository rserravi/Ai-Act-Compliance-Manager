import type { AISystem } from '../../domain/models';
import type { ProjectFilter } from './Model';

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

export function filterProjects(projects: AISystem[], filter: ProjectFilter): ProjectRow[] {
  return projects
    .filter((project) => {
      const byRole = filter.role ? project.role === filter.role : true;
      const byRisk = filter.risk ? project.risk === filter.risk : true;
      const byDoc = filter.doc ? project.docStatus === filter.doc : true;
      const bySearch = filter.q
        ? project.name.toLowerCase().includes(filter.q.toLowerCase())
        : true;
      return byRole && byRisk && byDoc && bySearch;
    })
    .map((project) => ({
      ...project,
      projectState: resolveProjectState(project)
    }));
}

export function getProjectStateLabel(state: ProjectState): string {
  const labels: Record<ProjectState, string> = {
    initial: 'Inicial',
    in_progress: 'En curso',
    maintenance: 'Mantenimiento'
  };
  return labels[state] ?? state;
}
