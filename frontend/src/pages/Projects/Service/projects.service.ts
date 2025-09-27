import { systems } from '../../../mocks/data'
import type { AISystem } from '../../../domain/models'
import { ProjectFilter } from '../Model'

export async function fetchSystems(filter: ProjectFilter): Promise<AISystem[]> {
  await new Promise(r => setTimeout(r, 100)) // mock latency
  return systems.filter(s => {
    const byRole = filter.role ? s.role === filter.role : true
    const byRisk = filter.risk ? s.risk === filter.risk : true
    const byDoc = filter.doc ? (s.docStatus === filter.doc) : true
    const byQ = filter.q ? s.name.toLowerCase().includes(filter.q.toLowerCase()) : true
    return byRole && byRisk && byDoc && byQ
  })
}
