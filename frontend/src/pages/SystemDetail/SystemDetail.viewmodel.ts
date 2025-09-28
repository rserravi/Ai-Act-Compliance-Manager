import { getSystemById } from './Service/system.service';
import { listRiskAssessments, type RiskAssessmentRow } from './Service/risk.service';
import type { AISystem } from '../../domain/models';
import { eventBus } from '../../shared/events/bus';
import type { AppEvent } from '../../shared/events/types';

export type SystemDetailData = {
  system: AISystem | null;
  assessments: RiskAssessmentRow[];
};

export class SystemDetailViewModel {
  async load(systemId: string): Promise<SystemDetailData> {
    const [system, assessments] = await Promise.all([
      getSystemById(systemId),
      listRiskAssessments(systemId)
    ]);
    return { system, assessments };
  }

  onUpdates(systemId: string, callback: () => void) {
    return eventBus.subscribe((event: AppEvent) => {
      if (event.type === 'RISK_ASSESSMENT_CREATED' && event.payload.assessment.systemId === systemId) {
        callback();
      }
      if (event.type === 'SYSTEM_UPDATED' && event.payload.system.id === systemId) {
        callback();
      }
    });
  }
}
