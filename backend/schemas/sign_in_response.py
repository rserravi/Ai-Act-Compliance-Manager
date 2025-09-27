from pydantic import BaseModel

from .user import User


class SignInResponse(BaseModel):
    user: User
    message: str
