from typing import Optional

from pydantic import BaseModel


class Evidence(BaseModel):
    id: str
    project_id: str
    type: str
    date: str
    owner: Optional[str] = None
