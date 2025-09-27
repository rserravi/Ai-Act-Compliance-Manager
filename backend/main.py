from collections import defaultdict
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Act Compliance Manager API", version="0.1.0")


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


class AISystem(BaseModel):
    id: str
    name: str
    role: str  # provider/importer/distributor/user
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    business_units: Optional[List[str]] = None
    team: Optional[List[str]] = None


class AISystemUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    business_units: Optional[List[str]] = None
    team: Optional[List[str]] = None


class RiskWizardConfig(BaseModel):
    steps: List[Dict[str, str]] = []


class RiskAssessment(BaseModel):
    id: str
    system_id: str
    date: str
    classification: str
    justification: Optional[str] = None


class DeliverableTemplate(BaseModel):
    id: str
    name: str
    type: str


class Deliverable(BaseModel):
    id: str
    system_id: str
    name: str
    version: Optional[str] = None
    status: Optional[str] = None
    link: Optional[str] = None


class DeliverableUpdate(BaseModel):
    version: Optional[str] = None
    status: Optional[str] = None
    link: Optional[str] = None


class DeliverableAssignment(BaseModel):
    assignee: str
    due_date: Optional[str] = None


class Task(BaseModel):
    id: str
    system_id: str
    title: str
    status: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None


class Incident(BaseModel):
    id: str
    system_id: Optional[str] = None
    severity: str
    status: str
    title: str
    description: str


class IncidentUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class Audit(BaseModel):
    id: str
    project_id: str
    name: str
    scope: str
    date: str
    status: str


class Evidence(BaseModel):
    id: str
    project_id: str
    type: str
    system_id: Optional[str] = None
    date: str
    owner: Optional[str] = None


class OrgStructure(BaseModel):
    project_id: str
    business_units: List[str] = []
    contacts: List[str] = []


class RACIEntry(BaseModel):
    role: str
    responsible: List[str]
    accountable: List[str]
    consulted: List[str]
    informed: List[str]


class Contact(BaseModel):
    id: str
    project_id: str
    name: str
    role: str
    email: Optional[str] = None


class DashboardOverview(BaseModel):
    kpis: Dict[str, str] = {}
    compliance_distribution: Dict[str, float] = {}
    timeline: List[Dict[str, str]] = []
    pending_actions: List[str] = []


class Settings(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications: Optional[List[str]] = None
    api_key: Optional[str] = None


class TechnicalDossierTemplate(BaseModel):
    sections: List[Dict[str, str]] = []


class TechnicalDossier(BaseModel):
    system_id: str
    fields: Dict[str, str] = {}


class TeamMember(BaseModel):
    id: str
    system_id: str
    name: str
    role: str


class PendingActivity(BaseModel):
    id: str
    description: str
    due_date: Optional[str] = None


# ---------------------------------------------------------------------------
# In-memory stores (placeholders until real persistence is added)
# ---------------------------------------------------------------------------

systems: Dict[str, AISystem] = {}
risk_assessments = defaultdict(list)
deliverables = defaultdict(list)
deliverable_templates: List[DeliverableTemplate] = []
tasks = defaultdict(list)
incidents: Dict[str, Incident] = {}
audits = defaultdict(list)
evidences = defaultdict(list)
org_structures: Dict[str, OrgStructure] = {}
raci_matrices = defaultdict(list)
contacts = defaultdict(list)
settings_store = Settings(language="es", theme="light", notifications=["email"], api_key="demo")
technical_dossier_templates = TechnicalDossierTemplate()
technical_dossiers: Dict[str, TechnicalDossier] = {}
teams = defaultdict(list)
pending_activities: List[PendingActivity] = []


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Systems
# ---------------------------------------------------------------------------


@app.get("/systems", response_model=List[AISystem])
def list_systems(role: Optional[str] = None, risk: Optional[str] = None, doc: Optional[str] = None, q: Optional[str] = None):
    data = list(systems.values())
    if role:
        data = [sys for sys in data if sys.role == role]
    if risk:
        data = [sys for sys in data if sys.risk == risk]
    if doc:
        data = [sys for sys in data if sys.documentation_status == doc]
    if q:
        data = [sys for sys in data if q.lower() in sys.name.lower()]
    return data


@app.post("/systems", response_model=AISystem)
def create_system(payload: AISystem):
    systems[payload.id] = payload
    return payload


@app.get("/systems/{system_id}", response_model=AISystem)
def get_system(system_id: str):
    system = systems.get(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system


@app.patch("/systems/{system_id}", response_model=AISystem)
def update_system(system_id: str, payload: AISystemUpdate):
    system = systems.get(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    update_data = payload.dict(exclude_unset=True)
    updated = system.copy(update=update_data)
    systems[system_id] = updated
    return updated


# ---------------------------------------------------------------------------
# Risk assessments
# ---------------------------------------------------------------------------


@app.get("/configs/risk-wizard", response_model=RiskWizardConfig)
def get_risk_wizard_config():
    return RiskWizardConfig()


@app.get("/systems/{system_id}/risk", response_model=List[RiskAssessment])
def list_risk_assessments(system_id: str):
    return risk_assessments[system_id]


@app.post("/systems/{system_id}/risk", response_model=RiskAssessment)
def create_risk_assessment(system_id: str, payload: RiskAssessment):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    risk_assessments[system_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Deliverables
# ---------------------------------------------------------------------------


@app.get("/deliverables/templates", response_model=List[DeliverableTemplate])
def list_deliverable_templates():
    return deliverable_templates


@app.get("/systems/{system_id}/deliverables", response_model=List[Deliverable])
def list_deliverables(system_id: str):
    return deliverables[system_id]


@app.patch("/deliverables/{deliverable_id}", response_model=Deliverable)
def update_deliverable(deliverable_id: str, payload: DeliverableUpdate):
    for system_deliverables in deliverables.values():
        for idx, deliverable in enumerate(system_deliverables):
            if deliverable.id == deliverable_id:
                updated = deliverable.copy(update=payload.dict(exclude_unset=True))
                system_deliverables[idx] = updated
                return updated
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/deliverables/{deliverable_id}/versions", response_model=Deliverable)
def add_deliverable_version(deliverable_id: str):
    # Placeholder endpoint: in a real implementation, file handling would be added
    for system_deliverables in deliverables.values():
        for deliverable in system_deliverables:
            if deliverable.id == deliverable_id:
                return deliverable
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/systems/{system_id}/deliverables/{deliverable_id}/assign")
def assign_deliverable(system_id: str, deliverable_id: str, payload: DeliverableAssignment):
    return {"system_id": system_id, "deliverable_id": deliverable_id, **payload.dict()}


# ---------------------------------------------------------------------------
# Tasks and workflows
# ---------------------------------------------------------------------------


@app.get("/systems/{system_id}/tasks", response_model=List[Task])
def list_tasks(system_id: str):
    return tasks[system_id]


@app.post("/systems/{system_id}/tasks", response_model=Task)
def create_task(system_id: str, payload: Task):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    tasks[system_id].append(payload)
    return payload


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, payload: TaskUpdate):
    for system_tasks in tasks.values():
        for idx, task in enumerate(system_tasks):
            if task.id == task_id:
                updated = task.copy(update=payload.dict(exclude_unset=True))
                system_tasks[idx] = updated
                return updated
    raise HTTPException(status_code=404, detail="Task not found")


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------


@app.get("/incidents")
def list_incidents(system_id: Optional[str] = None):
    data = list(incidents.values())
    if system_id:
        data = [incident for incident in data if incident.system_id == system_id]
    return data


@app.post("/incidents", response_model=Incident)
def create_incident(payload: Incident):
    incidents[payload.id] = payload
    return payload


@app.patch("/incidents/{incident_id}", response_model=Incident)
def update_incident(incident_id: str, payload: IncidentUpdate):
    incident = incidents.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    updated = incident.copy(update=payload.dict(exclude_unset=True))
    incidents[incident_id] = updated
    return updated


# ---------------------------------------------------------------------------
# Audits and evidences
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/audits", response_model=List[Audit])
def list_audits(project_id: str):
    return audits[project_id]


@app.get("/projects/{project_id}/evidences", response_model=List[Evidence])
def list_evidences(project_id: str):
    return evidences[project_id]


@app.post("/projects/{project_id}/evidences", response_model=Evidence)
def create_evidence(project_id: str, payload: Evidence):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    evidences[project_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Governance and roles
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/org-structure", response_model=OrgStructure)
def get_org_structure(project_id: str):
    structure = org_structures.get(project_id)
    if not structure:
        structure = OrgStructure(project_id=project_id)
        org_structures[project_id] = structure
    return structure


@app.post("/projects/{project_id}/raci")
def create_raci(project_id: str, payload: List[RACIEntry]):
    raci_matrices[project_id] = payload
    return {"project_id": project_id, "entries": payload}


@app.post("/projects/{project_id}/contacts", response_model=Contact)
def create_contact(project_id: str, payload: Contact):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    contacts[project_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


@app.get("/dashboard/overview", response_model=DashboardOverview)
def get_dashboard_overview():
    return DashboardOverview()


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------


@app.get("/settings", response_model=Settings)
def get_settings():
    return settings_store


@app.patch("/settings", response_model=Settings)
def update_settings(payload: Settings):
    global settings_store
    settings_store = settings_store.copy(update=payload.dict(exclude_unset=True))
    return settings_store


# ---------------------------------------------------------------------------
# Technical dossier
# ---------------------------------------------------------------------------


@app.get("/configs/technical-dossier", response_model=TechnicalDossierTemplate)
def get_technical_dossier_template():
    return technical_dossier_templates


@app.get("/systems/{system_id}/technical-dossier", response_model=TechnicalDossier)
def get_technical_dossier(system_id: str):
    dossier = technical_dossiers.get(system_id)
    if not dossier:
        dossier = TechnicalDossier(system_id=system_id)
        technical_dossiers[system_id] = dossier
    return dossier


@app.put("/systems/{system_id}/technical-dossier", response_model=TechnicalDossier)
def update_technical_dossier(system_id: str, payload: TechnicalDossier):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    technical_dossiers[system_id] = payload
    return payload


# ---------------------------------------------------------------------------
# Catalogs & auxiliary endpoints
# ---------------------------------------------------------------------------


@app.get("/systems/{system_id}/team", response_model=List[TeamMember])
def list_team_members(system_id: str):
    return teams[system_id]


@app.get("/activities/pending", response_model=List[PendingActivity])
def list_pending_activities():
    return pending_activities


