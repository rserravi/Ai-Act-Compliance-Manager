from typing import Optional

from pydantic import BaseModel


class Contact(BaseModel):
    id: str
    project_id: str
    name: str
    role: str
    email: Optional[str] = None
