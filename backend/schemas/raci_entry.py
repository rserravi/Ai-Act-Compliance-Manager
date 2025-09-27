from typing import List

from pydantic import BaseModel


class RACIEntry(BaseModel):
    role: str
    responsible: List[str]
    accountable: List[str]
    consulted: List[str]
    informed: List[str]
