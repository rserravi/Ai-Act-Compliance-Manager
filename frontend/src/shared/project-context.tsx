import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react'
import type { AISystem, DocumentRef, DeliverableType, Contact, Task } from '../domain/models'
import { systems as initialSystems } from '../mocks/data'

const requiredDeliverables: { name: string, type: DeliverableType }[] = [
  { name: 'Documentación Técnica (Anexo IV)', type: 'technical_documentation' },
  { name: 'Declaración de Conformidad de la UE', type: 'declaration_of_conformity' },
  { name: 'Documentación del Sistema de Gestión de Calidad', type: 'quality_management_system' },
  { name: 'Plan de Seguimiento Post-Comercialización', type: 'post_market_monitoring_plan' },
  { name: 'Instrucciones de Uso', type: 'instructions_for_use' },
  { name: 'Registros (Logs) generados automáticamente', type: 'logs' }
]

type CreateProjectInput = {
  name: string
  role: AISystem['role']
  team?: Contact[]
  risk?: AISystem['risk']
  businessUnit?: string
}

type ProjectContextValue = {
  projects: AISystem[]
  documents: DocumentRef[]
  tasks: Task[]
  activeProjectId: string | null
  activeProject: AISystem | null
  setActiveProjectId: (id: string | null) => void
  createProject: (input: CreateProjectInput) => AISystem
  getDocumentsByProjectId: (projectId: string) => DocumentRef[]
  updateDocument: (docId: string, newVersion: number, newStatus: DocumentRef['status']) => void
  createTask: (taskInput: Omit<Task, 'id'>) => void
  getProjectById: (projectId: string) => AISystem | undefined
  getTasksByProjectId: (projectId: string) => Task[]
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

const ACTIVE_KEY = 'app.activeProjectId'

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<AISystem[]>(() => initialSystems.map((system) => ({ ...system })))
  const [documents, setDocuments] = useState<DocumentRef[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(ACTIVE_KEY)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (activeProjectId) window.localStorage.setItem(ACTIVE_KEY, activeProjectId)
    else window.localStorage.removeItem(ACTIVE_KEY)
  }, [activeProjectId])

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null
    return projects.find(p => p.id === activeProjectId) ?? null
  }, [projects, activeProjectId])

  const setActiveProjectId = (id: string | null) => {
    setActiveProjectIdState(id)
  }

  const createInitialDocuments = (project: AISystem) => {
    const now = new Date().toISOString()
    const newDocs: DocumentRef[] = requiredDeliverables.map(d => ({
      id: `doc-${project.id}-${d.type}`,
      systemId: project.id,
      name: d.name,
      type: d.type,
      version: 0,
      status: 'Abierto',
      updatedAt: now
    }))
    setDocuments(prev => [...prev, ...newDocs])
  }

  const createProject = (input: CreateProjectInput): AISystem => {
    const now = new Date()
    const newProject: AISystem = {
      id: `prj-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      role: input.role,
      businessUnit: input.businessUnit,
      team: input.team,
      risk: input.risk,
      docStatus: 'borrador',
      lastAssessment: now.toISOString().slice(0, 10)
    }
    setProjects(prev => [...prev, newProject])
    createInitialDocuments(newProject)
    setActiveProjectIdState(newProject.id)
    return newProject
  }

  const getDocumentsByProjectId = (projectId: string) => {
    return documents.filter(doc => doc.systemId === projectId)
  }

  const getProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId)
  }

  const getTasksByProjectId = (projectId: string) => {
    return tasks.filter(task => task.systemId === projectId)
  }

  const updateDocument = (docId: string, newVersion: number, newStatus: DocumentRef['status']) => {
    const now = new Date().toISOString()
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, version: newVersion, status: newStatus, updatedAt: now, link: '#mock-link' } // Add mock link
          : doc
      )
    )
  }

  const createTask = (taskInput: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: `task-${Math.random().toString(36).slice(2, 8)}`,
      ...taskInput
    }
    setTasks(prev => [...prev, newTask])
  }

  const value = useMemo<ProjectContextValue>(() => ({
    projects,
    documents,
    tasks,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    createProject,
    getDocumentsByProjectId,
    updateDocument,
    createTask,
    getProjectById,
    getTasksByProjectId
  }), [projects, documents, tasks, activeProjectId, activeProject])

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProjectContext must be used within a ProjectProvider')
  return context
}