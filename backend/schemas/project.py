from typing import List, Optional

from pydantic import BaseModel


class Project(BaseModel):
    id: str
    name: str
    role: str  # provider/importer/distributor/user
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    business_units: Optional[List[str]] = None
    team: Optional[List[str]] = None
