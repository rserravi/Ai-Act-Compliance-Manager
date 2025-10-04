from typing import Any, Dict, List

from pydantic import BaseModel, Field


class RiskEvaluationPayload(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)


class RiskEvaluationResult(BaseModel):
    classification: str
    justification: str
    obligations: List[str] = Field(default_factory=list)
