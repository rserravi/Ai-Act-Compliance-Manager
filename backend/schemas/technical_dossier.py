from typing import Dict

from pydantic import BaseModel, Field


class TechnicalDossier(BaseModel):
    system_id: str
    fields: Dict[str, str] = Field(default_factory=dict)
