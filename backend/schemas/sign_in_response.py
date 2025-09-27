from datetime import datetime

from pydantic import BaseModel


class SignInResponse(BaseModel):
    registration_id: str
    message: str
    expires_at: datetime
