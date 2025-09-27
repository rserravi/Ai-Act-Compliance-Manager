from pydantic import BaseModel


class LoginPayload(BaseModel):
    company: str
    email: str
    password: str
