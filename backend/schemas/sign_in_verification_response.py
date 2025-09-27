from pydantic import BaseModel

from .user import User


class SignInVerificationResponse(BaseModel):
    token: str
    user: User
    message: str
