import type { DocumentRef, Task } from '../../domain/models';
import type { ProjectStore } from '../../state/project-store';
import { fetchProjectDeliverables } from '../Projects/Service/projects.service';

export class DeliverablesViewModel {
  constructor(private readonly store: ProjectStore) {}

  getProject(projectId: string | null) {
    if (!projectId) return null;
    return this.store.getProjectById(projectId) ?? null;
  }

  getDocuments(projectId: string | null): DocumentRef[] {
    if (!projectId) return [];
    return this.store.getDocumentsByProjectId(projectId);
  }

  async refreshDocuments(projectId: string): Promise<DocumentRef[]> {
    const documents = await fetchProjectDeliverables(projectId);
    this.store.setDocumentsForProject(projectId, documents);
    return documents;
  }

  uploadNewVersion(docId: string, currentVersion: number) {
    const nextVersion = currentVersion + 1;
    this.store.updateDocument(docId, nextVersion, 'En Revisión');
  }

  createAssignment(projectId: string, document: DocumentRef, assignee: string, dueDate: string): Task {
    const task: Omit<Task, 'id'> = {
      systemId: projectId,
      title: `Preparar entregable: ${document.name}`,
      assignee,
      due: dueDate,
      status: 'todo'
    };
    return this.store.createTask(task);
  }
}
