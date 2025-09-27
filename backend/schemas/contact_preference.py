from typing import Optional

from pydantic import BaseModel

from .contact_method import ContactMethod


class ContactPreference(BaseModel):
    method: ContactMethod
    value: str
    workspace: Optional[str] = None
    channel: Optional[str] = None
