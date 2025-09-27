import os
import secrets
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.database import SessionLocal, get_db, init_db
from backend.repositories.user_repository import (
    create_user,
    get_user_by_id,
    get_user_model_by_email,
    model_to_schema,
    update_user_company,
)
from backend.security import verify_password

from backend.schemas import (
    AISystem,
    AISystemUpdate,
    Audit,
    Contact,
    ContactMethod,
    ContactPreference,
    DashboardOverview,
    Deliverable,
    DeliverableAssignment,
    DeliverableTemplate,
    DeliverableUpdate,
    Evidence,
    Incident,
    IncidentUpdate,
    LoginPayload,
    LoginResult,
    OrgStructure,
    PendingActivity,
    RACIEntry,
    RiskAssessment,
    RiskWizardConfig,
    Settings,
    SignInPayload,
    SignInResponse,
    SSOLoginPayload,
    Task,
    TaskUpdate,
    TeamMember,
    TechnicalDossier,
    TechnicalDossierTemplate,
    User,
)

load_dotenv()

app = FastAPI(title="AI Act Compliance Manager API", version="0.1.0")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

bearer_scheme = HTTPBearer(auto_error=False)

init_db()


def _create_access_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    expire_delta = expires_delta or timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_at = datetime.utcnow() + expire_delta
    payload = {"sub": user.id, "email": user.email, "exp": expire_at}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials") from exc


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


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


def _infer_company_from_email(email: str) -> Optional[str]:
    if "@" not in email:
        return None
    domain = email.split("@", 1)[1]
    if not domain:
        return None
    name_part = domain.split(".", 1)[0]
    cleaned = name_part.replace("-", " ").replace("_", " ").strip()
    if not cleaned:
        return None
    return cleaned.title()


def _ensure_default_user() -> None:
    with SessionLocal() as db:
        existing = get_user_model_by_email(db, "rocio.serrano@acme.ai")
        if existing:
            return

        contact_pref = ContactPreference(
            method=ContactMethod.email,
            value="rocio.serrano@acme.ai",
        )

        create_user(
            db,
            user_id=str(uuid4()),
            company="Acme Corp",
            full_name="Rocío Serrano",
            email="rocio.serrano@acme.ai",
            avatar=None,
            contact=contact_pref,
            password="demo123",
        )


_ensure_default_user()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


@app.post("/auth/login", response_model=LoginResult)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user_model = get_user_model_by_email(db, email)
    if not user_model:
        raise HTTPException(status_code=404, detail="User not found")

    if user_model.company:
        if payload.company.lower().strip() != (user_model.company or "").lower().strip():
            raise HTTPException(status_code=403, detail="Company mismatch")
    else:
        update_user_company(db, user_model, payload.company)

    if not user_model.password_hash:
        raise HTTPException(status_code=403, detail="Password login unavailable for this user")

    if not verify_password(payload.password, user_model.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = model_to_schema(user_model)
    token = _create_access_token(user)
    return LoginResult(token=token, user=user)


@app.post("/auth/login/sso", response_model=LoginResult)
def login_sso(payload: SSOLoginPayload, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user_model = get_user_model_by_email(db, email)
    if user_model is None:
        inferred_company = _infer_company_from_email(payload.email)
        contact_pref = ContactPreference(method=ContactMethod.email, value=payload.email)
        user_model = create_user(
            db,
            user_id=str(uuid4()),
            company=inferred_company,
            full_name=payload.email.split("@", 1)[0].replace(".", " ").title(),
            email=payload.email,
            avatar=None,
            contact=contact_pref,
            password=None,
        )

    if payload.company and payload.company.strip():
        update_user_company(db, user_model, payload.company)
    elif not user_model.company:
        inferred_company = _infer_company_from_email(payload.email)
        if inferred_company:
            update_user_company(db, user_model, inferred_company)

    user = model_to_schema(user_model)
    token = _create_access_token(user)
    return LoginResult(token=token, user=user)


@app.get("/auth/me", response_model=User)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/auth/sign-in", response_model=SignInResponse)
def sign_in(payload: SignInPayload, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = get_user_model_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    company = _infer_company_from_email(payload.email)
    user_id = str(uuid4())
    temporary_password = secrets.token_urlsafe(8)

    user_model = create_user(
        db,
        user_id=user_id,
        company=company,
        full_name=payload.full_name,
        email=payload.email,
        avatar=payload.avatar,
        contact=payload.contact,
        password=temporary_password,
    )

    user = model_to_schema(user_model)
    message = "User registered successfully. Use the temporary password to log in."
    return SignInResponse(user=user, temporary_password=temporary_password, message=message)


# ---------------------------------------------------------------------------
# Systems
# ---------------------------------------------------------------------------


@app.get("/systems", response_model=List[AISystem])
def list_systems(
    current_user: User = Depends(get_current_user),
    role: Optional[str] = None,
    risk: Optional[str] = None,
    doc: Optional[str] = None,
    q: Optional[str] = None,
):
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
def create_system(payload: AISystem, current_user: User = Depends(get_current_user)):
    systems[payload.id] = payload
    return payload


@app.get("/systems/{system_id}", response_model=AISystem)
def get_system(system_id: str, current_user: User = Depends(get_current_user)):
    system = systems.get(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system


@app.patch("/systems/{system_id}", response_model=AISystem)
def update_system(system_id: str, payload: AISystemUpdate, current_user: User = Depends(get_current_user)):
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
def get_risk_wizard_config(current_user: User = Depends(get_current_user)):
    return RiskWizardConfig()


@app.get("/systems/{system_id}/risk", response_model=List[RiskAssessment])
def list_risk_assessments(system_id: str, current_user: User = Depends(get_current_user)):
    return risk_assessments[system_id]


@app.post("/systems/{system_id}/risk", response_model=RiskAssessment)
def create_risk_assessment(
    system_id: str,
    payload: RiskAssessment,
    current_user: User = Depends(get_current_user),
):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    risk_assessments[system_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Deliverables
# ---------------------------------------------------------------------------


@app.get("/deliverables/templates", response_model=List[DeliverableTemplate])
def list_deliverable_templates(current_user: User = Depends(get_current_user)):
    return deliverable_templates


@app.get("/systems/{system_id}/deliverables", response_model=List[Deliverable])
def list_deliverables(system_id: str, current_user: User = Depends(get_current_user)):
    return deliverables[system_id]


@app.patch("/deliverables/{deliverable_id}", response_model=Deliverable)
def update_deliverable(
    deliverable_id: str,
    payload: DeliverableUpdate,
    current_user: User = Depends(get_current_user),
):
    for system_deliverables in deliverables.values():
        for idx, deliverable in enumerate(system_deliverables):
            if deliverable.id == deliverable_id:
                updated = deliverable.copy(update=payload.dict(exclude_unset=True))
                system_deliverables[idx] = updated
                return updated
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/deliverables/{deliverable_id}/versions", response_model=Deliverable)
def add_deliverable_version(
    deliverable_id: str, current_user: User = Depends(get_current_user)
):
    # Placeholder endpoint: in a real implementation, file handling would be added
    for system_deliverables in deliverables.values():
        for deliverable in system_deliverables:
            if deliverable.id == deliverable_id:
                return deliverable
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/systems/{system_id}/deliverables/{deliverable_id}/assign")
def assign_deliverable(
    system_id: str,
    deliverable_id: str,
    payload: DeliverableAssignment,
    current_user: User = Depends(get_current_user),
):
    return {"system_id": system_id, "deliverable_id": deliverable_id, **payload.dict()}


# ---------------------------------------------------------------------------
# Tasks and workflows
# ---------------------------------------------------------------------------


@app.get("/systems/{system_id}/tasks", response_model=List[Task])
def list_tasks(system_id: str, current_user: User = Depends(get_current_user)):
    return tasks[system_id]


@app.post("/systems/{system_id}/tasks", response_model=Task)
def create_task(
    system_id: str,
    payload: Task,
    current_user: User = Depends(get_current_user),
):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    tasks[system_id].append(payload)
    return payload


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
):
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
def list_incidents(
    system_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    data = list(incidents.values())
    if system_id:
        data = [incident for incident in data if incident.system_id == system_id]
    return data


@app.post("/incidents", response_model=Incident)
def create_incident(payload: Incident, current_user: User = Depends(get_current_user)):
    incidents[payload.id] = payload
    return payload


@app.patch("/incidents/{incident_id}", response_model=Incident)
def update_incident(
    incident_id: str,
    payload: IncidentUpdate,
    current_user: User = Depends(get_current_user),
):
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
def list_audits(project_id: str, current_user: User = Depends(get_current_user)):
    return audits[project_id]


@app.get("/projects/{project_id}/evidences", response_model=List[Evidence])
def list_evidences(project_id: str, current_user: User = Depends(get_current_user)):
    return evidences[project_id]


@app.post("/projects/{project_id}/evidences", response_model=Evidence)
def create_evidence(
    project_id: str,
    payload: Evidence,
    current_user: User = Depends(get_current_user),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    evidences[project_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Governance and roles
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/org-structure", response_model=OrgStructure)
def get_org_structure(project_id: str, current_user: User = Depends(get_current_user)):
    structure = org_structures.get(project_id)
    if not structure:
        structure = OrgStructure(project_id=project_id)
        org_structures[project_id] = structure
    return structure


@app.post("/projects/{project_id}/raci")
def create_raci(
    project_id: str,
    payload: List[RACIEntry],
    current_user: User = Depends(get_current_user),
):
    raci_matrices[project_id] = payload
    return {"project_id": project_id, "entries": payload}


@app.post("/projects/{project_id}/contacts", response_model=Contact)
def create_contact(
    project_id: str,
    payload: Contact,
    current_user: User = Depends(get_current_user),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    contacts[project_id].append(payload)
    return payload


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


@app.get("/dashboard/overview", response_model=DashboardOverview)
def get_dashboard_overview(current_user: User = Depends(get_current_user)):
    return DashboardOverview()


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------


@app.get("/settings", response_model=Settings)
def get_settings(current_user: User = Depends(get_current_user)):
    return settings_store


@app.patch("/settings", response_model=Settings)
def update_settings(payload: Settings, current_user: User = Depends(get_current_user)):
    global settings_store
    settings_store = settings_store.copy(update=payload.dict(exclude_unset=True))
    return settings_store


# ---------------------------------------------------------------------------
# Technical dossier
# ---------------------------------------------------------------------------


@app.get("/configs/technical-dossier", response_model=TechnicalDossierTemplate)
def get_technical_dossier_template(current_user: User = Depends(get_current_user)):
    return technical_dossier_templates


@app.get("/systems/{system_id}/technical-dossier", response_model=TechnicalDossier)
def get_technical_dossier(system_id: str, current_user: User = Depends(get_current_user)):
    dossier = technical_dossiers.get(system_id)
    if not dossier:
        dossier = TechnicalDossier(system_id=system_id)
        technical_dossiers[system_id] = dossier
    return dossier


@app.put("/systems/{system_id}/technical-dossier", response_model=TechnicalDossier)
def update_technical_dossier(
    system_id: str,
    payload: TechnicalDossier,
    current_user: User = Depends(get_current_user),
):
    if payload.system_id != system_id:
        raise HTTPException(status_code=400, detail="system_id mismatch")
    technical_dossiers[system_id] = payload
    return payload


# ---------------------------------------------------------------------------
# Catalogs & auxiliary endpoints
# ---------------------------------------------------------------------------


@app.get("/systems/{system_id}/team", response_model=List[TeamMember])
def list_team_members(system_id: str, current_user: User = Depends(get_current_user)):
    return teams[system_id]


@app.get("/activities/pending", response_model=List[PendingActivity])
def list_pending_activities(current_user: User = Depends(get_current_user)):
    return pending_activities


