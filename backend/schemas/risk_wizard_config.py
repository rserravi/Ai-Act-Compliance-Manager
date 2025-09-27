from typing import Dict, List

from pydantic import BaseModel, Field


class RiskWizardConfig(BaseModel):
    steps: List[Dict[str, str]] = Field(default_factory=list)
