from typing import Optional

from pydantic import BaseModel


class Deliverable(BaseModel):
    id: str
    system_id: str
    name: str
    version: Optional[str] = None
    status: Optional[str] = None
    link: Optional[str] = None
