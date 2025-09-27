from pydantic import BaseModel


class SignInVerificationResendPayload(BaseModel):
    registration_id: str
