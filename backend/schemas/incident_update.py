from typing import Optional

from pydantic import BaseModel


class IncidentUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
