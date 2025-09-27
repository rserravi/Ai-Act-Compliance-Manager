import { systems } from '../../../mocks/data'

export async function getSystemById(id: string) {
  await new Promise(r => setTimeout(r, 50))
  return systems.find(s => s.id === id) || null
}
