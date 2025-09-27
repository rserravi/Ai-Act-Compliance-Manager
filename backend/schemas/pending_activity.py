from typing import Optional

from pydantic import BaseModel


class PendingActivity(BaseModel):
    id: str
    description: str
    due_date: Optional[str] = None
