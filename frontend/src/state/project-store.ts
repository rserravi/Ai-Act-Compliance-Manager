import type { AISystem, DeliverableType, DocumentRef, ProjectTeamMember, RiskAnswer, Task } from '../domain/models';
import { systems as initialSystems } from '../mocks/data';
import { ObservableValue } from './observable';

const REQUIRED_DELIVERABLES: ReadonlyArray<{ name: string; type: DeliverableType }> = [
  { name: 'Documentación Técnica (Anexo IV)', type: 'technical_documentation' },
  { name: 'Declaración de Conformidad de la UE', type: 'declaration_of_conformity' },
  { name: 'Documentación del Sistema de Gestión de Calidad', type: 'quality_management_system' },
  { name: 'Plan de Seguimiento Post-Comercialización', type: 'post_market_monitoring_plan' },
  { name: 'Instrucciones de Uso', type: 'instructions_for_use' },
  { name: 'Registros (Logs) generados automáticamente', type: 'logs' }
];

const ACTIVE_KEY = 'app.activeProjectId';

export type CreateProjectInput = {
  name: string;
  role: AISystem['role'];
  purpose: string;
  owner: string;
  team?: ProjectTeamMember[];
  risk?: AISystem['risk'];
  businessUnit?: string;
  deployments: string[];
  riskAssessment?: {
    classification: AISystem['risk'];
    justification: string;
    answers: RiskAnswer[];
  };
};

function readStoredActiveProject(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

function storeActiveProject(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    window.localStorage.setItem(ACTIVE_KEY, id);
  } else {
    window.localStorage.removeItem(ACTIVE_KEY);
  }
}

export class ProjectStore {
  readonly projects = new ObservableValue<AISystem[]>([]);
  readonly documents = new ObservableValue<DocumentRef[]>([]);
  readonly tasks = new ObservableValue<Task[]>([]);
  readonly activeProjectId = new ObservableValue<string | null>(null);
  readonly activeProject = new ObservableValue<AISystem | null>(null);

  constructor() {
    const projects = initialSystems.map((system) => ({ ...system }));
    this.projects.value = projects;
    this.activeProjectId.value = readStoredActiveProject();
    this.#syncActiveProject();

    this.projects.subscribe(() => this.#syncActiveProject());
    this.activeProjectId.subscribe(() => {
      storeActiveProject(this.activeProjectId.value);
      this.#syncActiveProject();
    });
  }

  setActiveProjectId(id: string | null): void {
    this.activeProjectId.value = id;
  }

  replaceProjects(projects: AISystem[]): void {
    const cloned = projects.map((project) => ({ ...project }));
    this.projects.value = cloned;
  }

  setDocumentsForProject(projectId: string, documents: DocumentRef[]): void {
    const normalized = documents.map((doc) => ({ ...doc }));
    this.documents.update((prev) => {
      const others = prev.filter((doc) => doc.systemId !== projectId);
      return [...others, ...normalized];
    });
  }

  createProject(input: CreateProjectInput): AISystem {
    const now = new Date();
    const newProject: AISystem = {
      id: `prj-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      role: input.role,
      purpose: input.purpose.trim(),
      owner: input.owner.trim(),
      businessUnit: input.businessUnit,
      team: input.team,
      deployments: [...input.deployments],
      risk: input.risk ?? input.riskAssessment?.classification,
      docStatus: 'borrador',
      lastAssessment: now.toISOString().slice(0, 10),
      initialRiskAssessment: input.riskAssessment
        ? {
            classification: input.riskAssessment.classification,
            justification: input.riskAssessment.justification,
            answers: input.riskAssessment.answers.map((answer) => ({ ...answer }))
          }
        : undefined
    };

    this.projects.update((prev) => [...prev, newProject]);
    this.#createInitialDocuments(newProject);
    this.setActiveProjectId(newProject.id);
    return newProject;
  }

  getDocumentsByProjectId(projectId: string): DocumentRef[] {
    return this.documents.value.filter((doc) => doc.systemId === projectId);
  }

  updateDocument(docId: string, newVersion: number, newStatus: DocumentRef['status']): void {
    const now = new Date().toISOString();
    this.documents.update((docs) =>
      docs.map((doc) =>
        doc.id === docId
          ? { ...doc, version: newVersion, status: newStatus, updatedAt: now, link: '#mock-link' }
          : doc
      )
    );
  }

  createTask(taskInput: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      id: `task-${Math.random().toString(36).slice(2, 8)}`,
      ...taskInput
    };
    this.tasks.update((prev) => [...prev, newTask]);
    return newTask;
  }

  getProjectById(projectId: string): AISystem | undefined {
    return this.projects.value.find((project) => project.id === projectId);
  }

  getTasksByProjectId(projectId: string): Task[] {
    return this.tasks.value.filter((task) => task.systemId === projectId);
  }

  #createInitialDocuments(project: AISystem): void {
    const now = new Date().toISOString();
    const newDocs: DocumentRef[] = REQUIRED_DELIVERABLES.map((deliverable) => ({
      id: `doc-${project.id}-${deliverable.type}`,
      systemId: project.id,
      name: deliverable.name,
      type: deliverable.type,
      version: 0,
      status: 'Abierto',
      updatedAt: now
    }));
    this.documents.update((prev) => [...prev, ...newDocs]);
  }

  #syncActiveProject(): void {
    const id = this.activeProjectId.value;
    if (!id) {
      this.activeProject.value = null;
      return;
    }
    const project = this.getProjectById(id) ?? null;
    this.activeProject.value = project;
  }
}

export const projectStore = new ProjectStore();

export type ProjectStoreType = ProjectStore;
