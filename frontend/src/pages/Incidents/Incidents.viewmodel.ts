import { listIncidents, type IncidentRow } from './Service/incidents.service';
import { eventBus } from '../../shared/events/bus';
import type { AppEvent } from '../../shared/events/types';

export class IncidentsViewModel {
  async load(): Promise<IncidentRow[]> {
    return listIncidents();
  }

  onUpdates(callback: () => void) {
    return eventBus.subscribe((event: AppEvent) => {
      if (event.type === 'INCIDENT_REPORTED') {
        callback();
      }
    });
  }
}
