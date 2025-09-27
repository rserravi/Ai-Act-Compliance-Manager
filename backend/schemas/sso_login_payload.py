from pydantic import BaseModel


class SSOLoginPayload(BaseModel):
    company: str
    email: str
    provider: str
