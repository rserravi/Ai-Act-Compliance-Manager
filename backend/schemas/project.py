from typing import Any, List, Optional

from pydantic import BaseModel, Field


class RiskAnswer(BaseModel):
    key: str
    value: Any


class InitialRiskAssessment(BaseModel):
    classification: str
    justification: str
    answers: List[RiskAnswer] = Field(default_factory=list)


class ProjectBase(BaseModel):
    name: str
    role: str  # provider/importer/distributor/user
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    purpose: Optional[str] = None
    owner: Optional[str] = None
    business_units: Optional[List[str]] = None
    deployments: List[str] = Field(default_factory=list)
    team: Optional[List[str]] = None


class Project(ProjectBase):
    id: str
    initial_risk_assessment: Optional[InitialRiskAssessment] = None


class ProjectCreate(ProjectBase):
    id: Optional[str] = None
    initial_risk_assessment: Optional[InitialRiskAssessment] = None


class ProjectListResponse(BaseModel):
    items: List[Project]
    total: int
    page: int
    page_size: int
