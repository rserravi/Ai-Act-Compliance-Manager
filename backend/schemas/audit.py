from pydantic import BaseModel


class Audit(BaseModel):
    id: str
    project_id: str
    name: str
    scope: str
    date: str
    status: str
