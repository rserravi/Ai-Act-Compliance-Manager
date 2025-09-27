from typing import Dict, List

from pydantic import BaseModel, Field


class DashboardOverview(BaseModel):
    kpis: Dict[str, str] = Field(default_factory=dict)
    compliance_distribution: Dict[str, float] = Field(default_factory=dict)
    timeline: List[Dict[str, str]] = Field(default_factory=list)
    pending_actions: List[str] = Field(default_factory=list)
