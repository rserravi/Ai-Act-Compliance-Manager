from typing import Optional

from pydantic import BaseModel

from .contact_preference import ContactPreference
from .user_preferences import UserPreferences


class User(BaseModel):
    id: str
    company: Optional[str] = None
    full_name: str
    email: str
    contact: ContactPreference
    avatar: Optional[str] = None
    preferences: UserPreferences
