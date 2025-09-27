from typing import Optional

from pydantic import BaseModel


class Incident(BaseModel):
    id: str
    system_id: Optional[str] = None
    severity: str
    status: str
    title: str
    description: str
