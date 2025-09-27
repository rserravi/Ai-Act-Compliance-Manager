from typing import Optional

from pydantic import BaseModel


class DeliverableAssignment(BaseModel):
    assignee: str
    due_date: Optional[str] = None
