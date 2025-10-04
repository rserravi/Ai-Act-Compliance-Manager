from typing import Optional

from pydantic import BaseModel


class RiskAssessment(BaseModel):
    id: str
    project_id: str
    date: str
    classification: str
    justification: Optional[str] = None
