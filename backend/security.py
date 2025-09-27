import base64
import hashlib
import os
from functools import lru_cache
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


@lru_cache(maxsize=1)
def _get_fernet() -> Fernet:
    key = os.getenv("DATA_ENCRYPTION_KEY")
    if not key:
        secret = os.getenv("JWT_SECRET", "dev-secret-key")
        derived_key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
        key = derived_key.decode()

    if isinstance(key, str):
        key_bytes = key.encode()
    else:
        key_bytes = key

    try:
        return Fernet(key_bytes)
    except ValueError as exc:
        raise RuntimeError("Invalid DATA_ENCRYPTION_KEY. It must be 32 url-safe base64-encoded bytes.") from exc


def encrypt_value(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    fernet = _get_fernet()
    token = fernet.encrypt(value.encode())
    return token.decode()


def decrypt_value(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    fernet = _get_fernet()
    try:
        decrypted = fernet.decrypt(value.encode())
    except InvalidToken as exc:
        raise RuntimeError("Unable to decrypt stored data. Check encryption key consistency.") from exc
    return decrypted.decode()
