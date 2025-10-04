from pydantic import BaseModel


class TeamMember(BaseModel):
    id: str
    project_id: str
    name: str
    role: str
