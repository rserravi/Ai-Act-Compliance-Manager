from typing import List, Optional

from pydantic import BaseModel

from .project import InitialRiskAssessment


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    business_units: Optional[List[str]] = None
    team: Optional[List[str]] = None
    purpose: Optional[str] = None
    owner: Optional[str] = None
    deployments: Optional[List[str]] = None
    initial_risk_assessment: Optional[InitialRiskAssessment] = None
