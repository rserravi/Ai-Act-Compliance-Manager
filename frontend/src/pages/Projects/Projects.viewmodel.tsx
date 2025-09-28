import { useMemo, useState } from 'react'
import type { AISystem } from '../../domain/models'
import { ProjectFilter } from './Model'
import { projectStore } from '../../state/project-store'
import { useObservableValue } from '../../shared/hooks/useObservable'

type FilteredProject = AISystem

export function useProjectsViewModel() {
  const projects = useObservableValue(projectStore.projects)
  const [filter, setFilter] = useState<ProjectFilter>({})

  const items = useMemo<FilteredProject[]>(() => {
    return projects.filter(project => {
      const byRole = filter.role ? project.role === filter.role : true
      const byRisk = filter.risk ? project.risk === filter.risk : true
      const byDoc = filter.doc ? project.docStatus === filter.doc : true
      const bySearch = filter.q
        ? project.name.toLowerCase().includes(filter.q.toLowerCase())
        : true
      return byRole && byRisk && byDoc && bySearch
    })
  }, [projects, filter])

  return {
    items,
    loading: false,
    filter,
    setFilter
  }
}
