from pydantic import BaseModel

from .user import User


class SignInResponse(BaseModel):
    user: User
    temporary_password: str
    message: str
