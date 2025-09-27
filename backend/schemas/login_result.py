from pydantic import BaseModel

from .user import User


class LoginResult(BaseModel):
    token: str
    user: User
