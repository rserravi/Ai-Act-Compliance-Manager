from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import ProjectModel, RiskAssessmentModel
from backend.schemas import Project, ProjectUpdate, RiskAssessment


def _project_model_to_schema(model: ProjectModel) -> Project:
    return Project(
        id=model.id,
        name=model.name,
        role=model.role,
        risk=model.risk,
        documentation_status=model.documentation_status,
        business_units=model.business_units,
        team=model.team,
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
) -> List[Project]:
    stmt = select(ProjectModel)

    if role:
        stmt = stmt.where(ProjectModel.role == role)
    if risk:
        stmt = stmt.where(ProjectModel.risk == risk)
    if documentation_status:
        stmt = stmt.where(ProjectModel.documentation_status == documentation_status)
    if search:
        stmt = stmt.where(ProjectModel.name.ilike(f"%{search}%"))

    results = db.execute(stmt).scalars().all()
    return [_project_model_to_schema(model) for model in results]


def create_project(db: Session, payload: Project) -> Project:
    project_model = ProjectModel(
        id=payload.id,
        name=payload.name,
        role=payload.role,
        risk=payload.risk,
        documentation_status=payload.documentation_status,
        business_units=payload.business_units,
        team=payload.team,
    )
    db.add(project_model)
    db.commit()
    db.refresh(project_model)
    return _project_model_to_schema(project_model)


def update_project(db: Session, project_model: ProjectModel, payload: ProjectUpdate) -> Project:
    update_data = payload.dict(exclude_unset=True)
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
