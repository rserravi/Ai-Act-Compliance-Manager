from typing import List, Optional

from pydantic import BaseModel


class Settings(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications: Optional[List[str]] = None
    api_key: Optional[str] = None
