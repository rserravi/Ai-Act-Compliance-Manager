import { systems } from '../../mocks/data';

export type RiskLevel = 'high' | 'limited' | 'minimal';

export type RiskDistributionEntry = {
  level: RiskLevel;
  systems: number;
  percentage: number;
};

export type TimelineEvent = {
  id: string;
  date: string;
  type: 'riskAssessment' | 'incidentClosed' | 'documentUpdated' | 'taskCreated';
  systemId?: string;
  metadata?: Record<string, string>;
};

export type PendingAction = {
  id: string;
  titleKey: string;
  systemId: string;
  systemName: string;
  due: string;
  owner: string;
  status: 'todo' | 'in_review' | 'approved';
  priority: 'high' | 'medium' | 'low';
};

function isDueToday(iso: string): boolean {
  const due = new Date(iso);
  const today = new Date();
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

const RISK_DISTRIBUTION: RiskDistributionEntry[] = [
  { level: 'high', systems: 8, percentage: 33 },
  { level: 'limited', systems: 10, percentage: 42 },
  { level: 'minimal', systems: 6, percentage: 25 }
];

function buildRiskDistribution(): RiskDistributionEntry[] {
  return RISK_DISTRIBUTION.map((entry) => ({ ...entry }));
}

function buildTimeline(): TimelineEvent[] {
  return [
    {
      id: 'evt-1',
      date: '2025-09-15T10:30:00Z',
      type: 'riskAssessment',
      systemId: '3',
      metadata: { system: 'Scoring Crédito', classification: 'alto' }
    },
    {
      id: 'evt-2',
      date: '2025-09-14T16:10:00Z',
      type: 'incidentClosed',
      systemId: '1',
      metadata: { system: 'Motor RRHH', incident: 'INC-234', owner: 'Laura P.' }
    },
    {
      id: 'evt-3',
      date: '2025-09-13T09:05:00Z',
      type: 'documentUpdated',
      systemId: '4',
      metadata: { system: 'Monitorización Fraude', document: 'DoC v2' }
    },
    {
      id: 'evt-4',
      date: '2025-09-12T14:45:00Z',
      type: 'taskCreated',
      systemId: '5',
      metadata: {
        system: 'Asistente Ventas',
        taskKey: 'dashboard.actions.items.updateDataset'
      }
    }
  ];
}

function buildPendingActions(): PendingAction[] {
  return [
    {
      id: 'act-1',
      titleKey: 'dashboard.actions.items.reviewRisk',
      systemId: '3',
      systemName: 'Scoring Crédito',
      due: '2025-09-18',
      owner: 'María G.',
      status: 'in_review',
      priority: 'high'
    },
    {
      id: 'act-2',
      titleKey: 'dashboard.actions.items.updateDossier',
      systemId: '4',
      systemName: 'Monitorización Fraude',
      due: '2025-09-19',
      owner: 'Carlos M.',
      status: 'todo',
      priority: 'medium'
    },
    {
      id: 'act-3',
      titleKey: 'dashboard.actions.items.scheduleAudit',
      systemId: '1',
      systemName: 'Motor RRHH',
      due: '2025-09-18',
      owner: 'Ana L.',
      status: 'todo',
      priority: 'high'
    },
    {
      id: 'act-4',
      titleKey: 'dashboard.actions.items.validateIncident',
      systemId: '2',
      systemName: 'Chat Soporte',
      due: '2025-09-22',
      owner: 'Jordi S.',
      status: 'in_review',
      priority: 'low'
    }
  ];
}

type EvidenceStatus = 'pending' | 'submitted' | 'approved';

type Evidence = {
  id: string;
  systemId: string;
  due: string;
  status: EvidenceStatus;
};

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  return start;
}

function endOfWeek(date: Date): Date {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

function formatAsISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function buildMockEvidences(referenceDate: Date): Evidence[] {
  const weekStart = startOfWeek(referenceDate);

  return [
    {
      id: 'ev-1',
      systemId: '1',
      due: formatAsISODate(addDays(weekStart, 1)),
      status: 'pending'
    },
    {
      id: 'ev-2',
      systemId: '2',
      due: formatAsISODate(addDays(weekStart, 3)),
      status: 'submitted'
    },
    {
      id: 'ev-3',
      systemId: '3',
      due: formatAsISODate(addDays(weekStart, 4)),
      status: 'pending'
    },
    {
      id: 'ev-4',
      systemId: '4',
      due: formatAsISODate(addDays(weekStart, -2)),
      status: 'pending'
    },
    {
      id: 'ev-5',
      systemId: '5',
      due: formatAsISODate(addDays(weekStart, 8)),
      status: 'pending'
    }
  ];
}

function countPendingEvidencesThisWeek(referenceDate = new Date()): number {
  const evidences = buildMockEvidences(referenceDate);
  const start = startOfWeek(referenceDate);
  const end = endOfWeek(referenceDate);

  return evidences.filter((evidence) => {
    if (evidence.status !== 'pending') {
      return false;
    }
    const dueDate = parseISODate(evidence.due);
    return dueDate >= start && dueDate <= end;
  }).length;
}

export type DashboardViewModel = {
  kpis: {
    registeredSystems: number;
    highRiskSystems: number;
    pendingEvidencesThisWeek: number;
    tasksToday: number;
  };
  riskDistribution: RiskDistributionEntry[];
  timeline: TimelineEvent[];
  pendingActions: PendingAction[];
};

export function createDashboardViewModel(): DashboardViewModel {
  const pendingActions = buildPendingActions();
  const tasksToday = pendingActions.filter((action) => isDueToday(action.due)).length;

  const registeredSystems = systems.length;
  const highRiskSystems = systems.filter((system) => system.risk === 'alto').length;
  const pendingEvidencesThisWeek = countPendingEvidencesThisWeek();

  return {
    kpis: {
      registeredSystems,
      highRiskSystems,
      pendingEvidencesThisWeek,
      tasksToday
    },
    riskDistribution: buildRiskDistribution(),
    timeline: buildTimeline(),
    pendingActions
  };
}
