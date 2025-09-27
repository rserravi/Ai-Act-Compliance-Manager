// Simple pub/sub event bus
import { AppEvent } from './types'

type Handler = (evt: AppEvent) => void

class EventBus {
  private handlers = new Set<Handler>()
  emit(evt: AppEvent) { this.handlers.forEach(h => h(evt)) }
  subscribe(h: Handler) {
    this.handlers.add(h)
    return () => {
      this.handlers.delete(h)
    }
  }
}
export const eventBus = new EventBus()
