from typing import Optional

from pydantic import BaseModel


class Task(BaseModel):
    id: str
    project_id: str
    title: str
    status: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
