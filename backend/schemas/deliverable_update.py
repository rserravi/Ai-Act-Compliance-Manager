from typing import Optional

from pydantic import BaseModel


class DeliverableUpdate(BaseModel):
    version: Optional[str] = None
    status: Optional[str] = None
    link: Optional[str] = None
