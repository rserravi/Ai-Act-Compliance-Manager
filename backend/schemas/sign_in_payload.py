from typing import Optional

from pydantic import BaseModel, Field, validator

from .contact_preference import ContactPreference
from .user_preferences import UserPreferences


class SignInPayload(BaseModel):
    full_name: str
    company: str
    email: str
    contact: ContactPreference
    avatar: Optional[str] = None
    password: str = Field(..., min_length=6)
    preferences: UserPreferences

    @validator("company")
    def validate_company(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Company is required")
        return value

    @validator("password")
    def validate_password(cls, value: str) -> str:
        has_uppercase = any(character.isupper() for character in value)
        has_extended = any(not character.isalnum() for character in value)
        if not has_uppercase or not has_extended:
            raise ValueError("Password must include an uppercase letter and a special character")
        return value
