from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence
from uuid import uuid4

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from backend.models import ProjectModel, RiskAssessmentModel
from backend.schemas import (
    InitialRiskAssessment,
    Project,
    ProjectCreate,
    ProjectUpdate,
    RiskAssessment,
)


def _project_model_to_schema(model: ProjectModel) -> Project:
    initial_assessment = _initial_risk_assessment_from_dict(
        model.initial_risk_assessment
    )
    return Project(
        id=model.id,
        name=model.name,
        role=model.role,
        risk=model.risk,
        documentation_status=model.documentation_status,
        purpose=model.purpose,
        owner=model.owner,
        business_units=model.business_units,
        team=model.team,
        deployments=model.deployments or [],
        initial_risk_assessment=initial_assessment,
    )


def _risk_assessment_model_to_schema(model: RiskAssessmentModel) -> RiskAssessment:
    return RiskAssessment(
        id=model.id,
        project_id=model.project_id,
        date=model.date,
        classification=model.classification,
        justification=model.justification,
    )


def get_project_model_by_id(db: Session, project_id: str) -> Optional[ProjectModel]:
    return db.get(ProjectModel, project_id)


def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
    model = get_project_model_by_id(db, project_id)
    if model is None:
        return None
    return _project_model_to_schema(model)


def list_projects(
    db: Session,
    *,
    role: Optional[str] = None,
    risk: Optional[str] = None,
    documentation_status: Optional[str] = None,
    search: Optional[str] = None,
    owner_values: Optional[Sequence[str]] = None,
    page: int = 1,
    page_size: int = 10,
) -> tuple[List[Project], int, int, int]:
    safe_page = max(page, 1)
    safe_page_size = min(max(page_size, 1), 100)

    # Exclude columns that are in the model but not in the DB
    columns_to_select = [
        c
        for c in ProjectModel.__table__.c
        if c.name not in ["deployments", "initial_risk_assessment"]
    ]
    stmt = select(*columns_to_select)
    count_stmt = select(func.count()).select_from(ProjectModel)

    conditions: list[Any] = []

    if owner_values:
        conditions.append(ProjectModel.owner.in_(tuple(set(owner_values))))
    if role:
        conditions.append(ProjectModel.role == role)
    if risk:
        conditions.append(ProjectModel.risk == risk)
    if documentation_status:
        conditions.append(ProjectModel.documentation_status == documentation_status)
    if search:
        pattern = f"%{search}%"
        conditions.append(
            or_(
                ProjectModel.name.ilike(pattern),
                ProjectModel.purpose.ilike(pattern),
            )
        )

    if conditions:
        stmt = stmt.where(and_(*conditions))
        count_stmt = count_stmt.where(and_(*conditions))

    stmt = stmt.order_by(ProjectModel.created_at.desc())
    offset = (safe_page - 1) * safe_page_size
    stmt = stmt.offset(offset).limit(safe_page_size)

    results = db.execute(stmt).all()
    total = db.execute(count_stmt).scalar_one()

    # The query returns Row objects, not ProjectModel instances.
    # We create duck-typed objects that have the same attributes as a ProjectModel
    # to be compatible with _project_model_to_schema.
    class DuckTypedProjectModel:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

    models = []
    for row in results:
        data = dict(row._mapping)
        # Add missing attributes back with a default value as it's expected by the schema converter.
        data["deployments"] = None
        data["initial_risk_assessment"] = None
        model = DuckTypedProjectModel(**data)
        models.append(model)

    projects = [_project_model_to_schema(model) for model in results]
    return projects, total, safe_page, safe_page_size


def create_project(db: Session, payload: ProjectCreate) -> Project:
    project_id = payload.id or str(uuid4())
    initial_assessment_dict = (
        payload.initial_risk_assessment.dict()
        if payload.initial_risk_assessment
        else None
    )
    project_model = ProjectModel(
        id=project_id,
        name=payload.name,
        role=payload.role,
        risk=payload.risk,
        documentation_status=payload.documentation_status,
        purpose=payload.purpose,
        owner=payload.owner,
        business_units=payload.business_units,
        team=payload.team,
        deployments=payload.deployments or None,
        initial_risk_assessment=initial_assessment_dict,
    )
    db.add(project_model)
    db.commit()
    db.refresh(project_model)
    return _project_model_to_schema(project_model)


def update_project(db: Session, project_model: ProjectModel, payload: ProjectUpdate) -> Project:
    update_data = payload.dict(exclude_unset=True)
    if "initial_risk_assessment" in update_data:
        initial_assessment = update_data.pop("initial_risk_assessment")
        project_model.initial_risk_assessment = _serialize_initial_risk_assessment(
            initial_assessment
        )
    for field, value in update_data.items():
        setattr(project_model, field, value)

    db.add(project_model)
    db.commit()
    db.refresh(project_model)
    return _project_model_to_schema(project_model)


def list_risk_assessments(db: Session, project_id: str) -> List[RiskAssessment]:
    stmt = select(RiskAssessmentModel).where(RiskAssessmentModel.project_id == project_id)
    results = db.execute(stmt).scalars().all()
    return [_risk_assessment_model_to_schema(model) for model in results]


def create_risk_assessment(db: Session, payload: RiskAssessment) -> RiskAssessment:
    model = RiskAssessmentModel(
        id=payload.id,
        project_id=payload.project_id,
        date=payload.date,
        classification=payload.classification,
        justification=payload.justification,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return _risk_assessment_model_to_schema(model)


def _initial_risk_assessment_from_dict(
    data: Optional[Dict[str, Any]]
) -> Optional[InitialRiskAssessment]:
    if not data:
        return None
    try:
        return InitialRiskAssessment(**data)
    except (TypeError, ValueError):
        return None


def _serialize_initial_risk_assessment(
    data: Any,
) -> Optional[Dict[str, Any]]:
    if data is None:
        return None
    if isinstance(data, InitialRiskAssessment):
        return data.dict()
    if isinstance(data, dict):
        assessment = _initial_risk_assessment_from_dict(data)
        return assessment.dict() if assessment else None
    return None
