from typing import List, Optional

from pydantic import BaseModel


class AISystemUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    risk: Optional[str] = None
    documentation_status: Optional[str] = None
    business_units: Optional[List[str]] = None
    team: Optional[List[str]] = None
