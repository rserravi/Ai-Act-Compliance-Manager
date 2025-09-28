import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { projectStore } from '../../state/project-store'
import { useObservableValue } from '../../shared/hooks/useObservable'
import { DocumentRef, Task } from '../../domain/models'

export function useDeliverablesViewModel() {
  const { id: projectId } = useParams<{ id: string }>()
  const documentsState = useObservableValue(projectStore.documents)
  const projectsState = useObservableValue(projectStore.projects)

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocumentRef | null>(null)

  const project = useMemo(() => {
    if (!projectId) return undefined
    return projectStore.getProjectById(projectId)
  }, [projectId, projectsState])

  const documents = useMemo(() => {
    if (!projectId) return []
    return documentsState.filter(doc => doc.systemId === projectId)
  }, [projectId, documentsState])

  const handleUpload = (docId: string, currentVersion: number) => {
    const newVersion = currentVersion + 1
    projectStore.updateDocument(docId, newVersion, 'En Revisión')
  }

  const openAssignModal = (doc: DocumentRef) => {
    setSelectedDoc(doc)
    setAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setSelectedDoc(null)
    setAssignModalOpen(false)
  }

  const handleAssign = (assignee: string, dueDate: string) => {
    if (!selectedDoc || !projectId) return

    const taskInput: Omit<Task, 'id'> = {
      systemId: projectId,
      title: `Preparar entregable: ${selectedDoc.name}`,
      assignee: assignee,
      due: dueDate,
      status: 'todo'
    }
    projectStore.createTask(taskInput)
    closeAssignModal()
  }

  return {
    documents,
    project,
    assignModalOpen,
    selectedDoc,
    handleUpload,
    openAssignModal,
    closeAssignModal,
    handleAssign
  }
}