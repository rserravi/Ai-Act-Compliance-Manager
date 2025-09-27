from typing import List

from pydantic import BaseModel, Field


class OrgStructure(BaseModel):
    project_id: str
    business_units: List[str] = Field(default_factory=list)
    contacts: List[str] = Field(default_factory=list)
