from typing import Optional

from pydantic import BaseModel, Field

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


class UserProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=1)
    company: Optional[str] = None
    contact: ContactPreference
    preferences: UserPreferences
