from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Deliverable(BaseModel):
    id: str
    project_id: str
    name: str
    type: str
    version: int = 0
    status: str = "Abierto"
    link: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
