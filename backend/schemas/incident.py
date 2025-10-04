from typing import Optional

from pydantic import BaseModel


class Incident(BaseModel):
    id: str
    project_id: Optional[str] = None
    severity: str
    status: str
    title: str
    description: str
