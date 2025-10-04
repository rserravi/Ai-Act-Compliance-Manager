import os
import secrets
import string
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, DefaultDict, Dict, List, Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

load_dotenv()

from backend.database import SessionLocal, get_db, init_db
from backend.services.email_service import send_registration_code_email, send_welcome_email
from backend.services.risk_evaluation_service import evaluate_risk
from backend.repositories.pending_user_repository import (
    delete_pending_registration,
    get_pending_registration_by_id,
    pending_contact_to_schema,
    pending_preferences_to_schema,
    refresh_verification_code,
    upsert_pending_registration,
)
from backend.repositories.user_repository import (
    create_user,
    get_user_by_id,
    get_user_model_by_email,
    model_to_schema,
    update_user_company,
)
from backend.repositories.project_repository import (
    create_project as create_project_record,
    create_risk_assessment as create_risk_assessment_record,
    get_project_by_id as get_project_schema_by_id,
    get_project_model_by_id,
    list_projects as list_project_records,
    list_risk_assessments as list_risk_assessment_records,
    update_project as update_project_record,
)
from backend.security import verify_password

from backend.schemas import (
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
    Project,
    ProjectUpdate,
    RACIEntry,
    RiskAssessment,
    RiskEvaluationPayload,
    RiskEvaluationResult,
    RiskWizardConfig,
    Settings,
    SignInPayload,
    SignInResponse,
    SignInVerificationPayload,
    SignInVerificationResponse,
    SignInVerificationResendPayload,
    SSOLoginPayload,
    Task,
    TaskUpdate,
    TeamMember,
    TechnicalDossier,
    TechnicalDossierTemplate,
    User,
    UserPreferences,
)

app = FastAPI(title="AI Act Compliance Manager API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
VERIFICATION_CODE_TTL_MINUTES = int(os.getenv("SIGN_IN_CODE_TTL_MINUTES", "15"))

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


def _generate_verification_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


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

# Temporary alias to keep legacy endpoints functional while routes are migrated
# (legacy routes have been deprecated and data now lives in the database).
systems: Dict[str, Project] = {}
deliverables: DefaultDict[str, List[Deliverable]] = defaultdict(list)
deliverable_templates: List[DeliverableTemplate] = []
tasks: DefaultDict[str, List[Task]] = defaultdict(list)
incidents: Dict[str, Incident] = {}
audits = defaultdict(list)
evidences: DefaultDict[str, List[Evidence]] = defaultdict(list)
org_structures: Dict[str, OrgStructure] = {}
raci_matrices = defaultdict(list)
contacts = defaultdict(list)
settings_store = Settings(language="es", theme="light", notifications=["email"], api_key="demo")
technical_dossier_templates = TechnicalDossierTemplate()
technical_dossiers: Dict[str, TechnicalDossier] = {}
teams: DefaultDict[str, List[TeamMember]] = defaultdict(list)
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
            preferences=UserPreferences(language="es"),
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


def _initiate_registration(
    payload: SignInPayload,
    background_tasks: BackgroundTasks,
    db: Session,
) -> SignInResponse:
    email = payload.email.lower()
    existing = get_user_model_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    payload.email = email
    code = _generate_verification_code()
    print("Código de verificación generado:", code)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_CODE_TTL_MINUTES
    )
    pending = upsert_pending_registration(db, payload, code, expires_at)

    background_tasks.add_task(send_registration_code_email, pending.email, code)

    message = "Verification code sent to your email."
    return SignInResponse(
        registration_id=pending.id,
        message=message,
        expires_at=pending.code_expires_at,
    )


def _verify_registration(
    payload: SignInVerificationPayload,
    background_tasks: BackgroundTasks,
    db: Session,
) -> SignInVerificationResponse:
    pending = get_pending_registration_by_id(db, payload.registration_id)
    if pending is None:
        raise HTTPException(status_code=404, detail="Registration not found")

    expires_at = pending.code_expires_at
    if expires_at.tzinfo is None or expires_at.tzinfo.utcoffset(expires_at) is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        delete_pending_registration(db, pending)
        raise HTTPException(status_code=400, detail="Verification code expired")

    provided_code = payload.code.strip().upper()
    if pending.verification_code.upper() != provided_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if get_user_model_by_email(db, pending.email):
        delete_pending_registration(db, pending)
        raise HTTPException(status_code=400, detail="User already verified")

    contact = pending_contact_to_schema(pending)
    preferences = pending_preferences_to_schema(pending)
    user_model = create_user(
        db,
        user_id=pending.user_id,
        company=pending.company,
        full_name=pending.full_name,
        email=pending.email,
        avatar=pending.avatar,
        contact=contact,
        password_hash=pending.password_hash,
        preferences=preferences,
    )

    user = model_to_schema(user_model)
    token = _create_access_token(user)

    delete_pending_registration(db, pending)
    background_tasks.add_task(send_welcome_email, user.email, user.full_name)

    message = "Registration verified successfully."
    return SignInVerificationResponse(token=token, user=user, message=message)


def _resend_registration_code(
    payload: SignInVerificationResendPayload,
    background_tasks: BackgroundTasks,
    db: Session,
) -> SignInResponse:
    pending = get_pending_registration_by_id(db, payload.registration_id)
    if pending is None:
        raise HTTPException(status_code=404, detail="Registration not found")

    code = _generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_CODE_TTL_MINUTES
    )
    pending = refresh_verification_code(db, pending, code, expires_at)

    background_tasks.add_task(send_registration_code_email, pending.email, code)

    message = "A new verification code has been sent."
    return SignInResponse(
        registration_id=pending.id,
        message=message,
        expires_at=pending.code_expires_at,
    )


@app.post("/auth/sign-in", response_model=SignInResponse)
def sign_in(
    payload: SignInPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _initiate_registration(payload, background_tasks, db)


@app.post("/auth/sign-in/verify", response_model=SignInVerificationResponse)
def verify_sign_in(
    payload: SignInVerificationPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _verify_registration(payload, background_tasks, db)


@app.post("/auth/sign-in/resend", response_model=SignInResponse)
def resend_sign_in_code(
    payload: SignInVerificationResendPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _resend_registration_code(payload, background_tasks, db)


@app.post("/auth/sign-up/init", response_model=SignInResponse)
def sign_up_init(
    payload: SignInPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _initiate_registration(payload, background_tasks, db)


@app.post("/auth/sign-up/verify", response_model=SignInVerificationResponse)
def sign_up_verify(
    payload: SignInVerificationPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _verify_registration(payload, background_tasks, db)


@app.post("/auth/sign-up/resend", response_model=SignInResponse)
def sign_up_resend(
    payload: SignInVerificationResendPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _resend_registration_code(payload, background_tasks, db)


# ---------------------------------------------------------------------------
# Systems
# ---------------------------------------------------------------------------


@app.get("/projects", response_model=List[Project])
def list_projects(
    current_user: User = Depends(get_current_user),
    role: Optional[str] = None,
    risk: Optional[str] = None,
    doc: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return list_project_records(
        db,
        role=role,
        risk=risk,
        documentation_status=doc,
        search=q,
    )


@app.post("/projects", response_model=Project)
def create_project(
    payload: Project,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if get_project_model_by_id(db, payload.id):
        raise HTTPException(status_code=400, detail="Project already exists")
    return create_project_record(db, payload)


@app.get("/projects/{project_id}", response_model=Project)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_schema_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.patch("/projects/{project_id}", response_model=Project)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project_model = get_project_model_by_id(db, project_id)
    if not project_model:
        raise HTTPException(status_code=404, detail="Project not found")
    return update_project_record(db, project_model, payload)


# ---------------------------------------------------------------------------
# Risk assessments
# ---------------------------------------------------------------------------


@app.get("/configs/risk-wizard", response_model=RiskWizardConfig)
def get_risk_wizard_config(current_user: User = Depends(get_current_user)):
    return RiskWizardConfig()


@app.post("/risk-evaluations", response_model=RiskEvaluationResult)
def create_risk_evaluation(
    payload: RiskEvaluationPayload,
    current_user: User = Depends(get_current_user),
):
    result = evaluate_risk(payload.answers)
    return RiskEvaluationResult(**result)


@app.get("/projects/{project_id}/risk", response_model=List[RiskAssessment])
def list_risk_assessments(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not get_project_model_by_id(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return list_risk_assessment_records(db, project_id)


@app.post("/projects/{project_id}/risk", response_model=RiskAssessment)
def create_risk_assessment(
    project_id: str,
    payload: RiskAssessment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    if not get_project_model_by_id(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return create_risk_assessment_record(db, payload)


# ---------------------------------------------------------------------------
# Deliverables
# ---------------------------------------------------------------------------


@app.get("/deliverables/templates", response_model=List[DeliverableTemplate])
def list_deliverable_templates(current_user: User = Depends(get_current_user)):
    return deliverable_templates


@app.get("/projects/{project_id}/deliverables", response_model=List[Deliverable])
def list_deliverables(project_id: str, current_user: User = Depends(get_current_user)):
    return deliverables[project_id]


@app.patch("/deliverables/{deliverable_id}", response_model=Deliverable)
def update_deliverable(
    deliverable_id: str,
    payload: DeliverableUpdate,
    current_user: User = Depends(get_current_user),
):
    for project_deliverables in deliverables.values():
        for idx, deliverable in enumerate(project_deliverables):
            if deliverable.id == deliverable_id:
                updated = deliverable.copy(update=payload.dict(exclude_unset=True))
                project_deliverables[idx] = updated
                return updated
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/deliverables/{deliverable_id}/versions", response_model=Deliverable)
def add_deliverable_version(
    deliverable_id: str, current_user: User = Depends(get_current_user)
):
    # Placeholder endpoint: in a real implementation, file handling would be added
    for project_deliverables in deliverables.values():
        for deliverable in project_deliverables:
            if deliverable.id == deliverable_id:
                return deliverable
    raise HTTPException(status_code=404, detail="Deliverable not found")


@app.post("/projects/{project_id}/deliverables/{deliverable_id}/assign")
def assign_deliverable(
    project_id: str,
    deliverable_id: str,
    payload: DeliverableAssignment,
    current_user: User = Depends(get_current_user),
):
    return {"project_id": project_id, "deliverable_id": deliverable_id, **payload.dict()}


# ---------------------------------------------------------------------------
# Tasks and workflows
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/tasks", response_model=List[Task])
def list_tasks(project_id: str, current_user: User = Depends(get_current_user)):
    return tasks[project_id]


@app.post("/projects/{project_id}/tasks", response_model=Task)
def create_task(
    project_id: str,
    payload: Task,
    current_user: User = Depends(get_current_user),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    tasks[project_id].append(payload)
    return payload


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
):
    for project_tasks in tasks.values():
        for idx, task in enumerate(project_tasks):
            if task.id == task_id:
                updated = task.copy(update=payload.dict(exclude_unset=True))
                project_tasks[idx] = updated
                return updated
    raise HTTPException(status_code=404, detail="Task not found")


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------


@app.get("/incidents")
def list_incidents(
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    data = list(incidents.values())
    if project_id:
        data = [incident for incident in data if incident.project_id == project_id]
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


@app.get("/projects/{project_id}/technical-dossier", response_model=TechnicalDossier)
def get_technical_dossier(project_id: str, current_user: User = Depends(get_current_user)):
    dossier = technical_dossiers.get(project_id)
    if not dossier:
        dossier = TechnicalDossier(project_id=project_id)
        technical_dossiers[project_id] = dossier
    return dossier


@app.put("/projects/{project_id}/technical-dossier", response_model=TechnicalDossier)
def update_technical_dossier(
    project_id: str,
    payload: TechnicalDossier,
    current_user: User = Depends(get_current_user),
):
    if payload.project_id != project_id:
        raise HTTPException(status_code=400, detail="project_id mismatch")
    technical_dossiers[project_id] = payload
    return payload


# ---------------------------------------------------------------------------
# Catalogs & auxiliary endpoints
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/team", response_model=List[TeamMember])
def list_team_members(project_id: str, current_user: User = Depends(get_current_user)):
    return teams[project_id]


@app.get("/activities/pending", response_model=List[PendingActivity])
def list_pending_activities(current_user: User = Depends(get_current_user)):
    return pending_activities
