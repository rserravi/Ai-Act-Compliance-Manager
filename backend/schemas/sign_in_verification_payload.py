from pydantic import BaseModel


class SignInVerificationPayload(BaseModel):
    registration_id: str
    code: str
