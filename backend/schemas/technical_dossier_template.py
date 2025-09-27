from typing import Dict, List

from pydantic import BaseModel, Field


class TechnicalDossierTemplate(BaseModel):
    sections: List[Dict[str, str]] = Field(default_factory=list)
