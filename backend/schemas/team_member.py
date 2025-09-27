from pydantic import BaseModel


class TeamMember(BaseModel):
    id: str
    system_id: str
    name: str
    role: str
