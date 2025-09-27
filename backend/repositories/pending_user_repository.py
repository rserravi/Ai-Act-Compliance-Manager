from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import PendingUserRegistrationModel
from backend.schemas import ContactMethod, ContactPreference, SignInPayload, UserPreferences
from backend.security import decrypt_value, encrypt_value, hash_password


def get_pending_registration_by_email(
    db: Session, email: str
) -> Optional[PendingUserRegistrationModel]:
    statement = select(PendingUserRegistrationModel).where(
        PendingUserRegistrationModel.email == email.lower()
    )
    return db.execute(statement).scalar_one_or_none()


def get_pending_registration_by_id(
    db: Session, registration_id: str
) -> Optional[PendingUserRegistrationModel]:
    statement = select(PendingUserRegistrationModel).where(
        PendingUserRegistrationModel.id == registration_id
    )
    return db.execute(statement).scalar_one_or_none()


def upsert_pending_registration(
    db: Session, payload: SignInPayload, code: str, expires_at: datetime
) -> PendingUserRegistrationModel:
    existing = get_pending_registration_by_email(db, payload.email)
    now = datetime.utcnow()

    contact = payload.contact
    encrypted_value = encrypt_value(contact.value) or ""
    encrypted_workspace = encrypt_value(contact.workspace)
    encrypted_channel = encrypt_value(contact.channel)

    if existing is None:
        pending = PendingUserRegistrationModel(
            id=str(uuid4()),
            user_id=str(uuid4()),
            email=payload.email.lower(),
            full_name=payload.full_name.strip(),
            company=payload.company.strip() or None,
            avatar=payload.avatar,
            password_hash=hash_password(payload.password),
            contact_method=contact.method.value,
            contact_value_encrypted=encrypted_value,
            contact_workspace_encrypted=encrypted_workspace,
            contact_channel_encrypted=encrypted_channel,
            preferences_language=payload.preferences.language,
            verification_code=code,
            code_sent_at=now,
            code_expires_at=expires_at,
        )
        db.add(pending)
    else:
        pending = existing
        pending.full_name = payload.full_name.strip()
        pending.company = payload.company.strip() or None
        pending.avatar = payload.avatar
        pending.password_hash = hash_password(payload.password)
        pending.contact_method = contact.method.value
        pending.contact_value_encrypted = encrypted_value
        pending.contact_workspace_encrypted = encrypted_workspace
        pending.contact_channel_encrypted = encrypted_channel
        pending.preferences_language = payload.preferences.language
        pending.verification_code = code
        pending.code_sent_at = now
        pending.code_expires_at = expires_at
        db.add(pending)

    db.commit()
    db.refresh(pending)
    return pending


def refresh_verification_code(
    db: Session, pending: PendingUserRegistrationModel, code: str, expires_at: datetime
) -> PendingUserRegistrationModel:
    pending.verification_code = code
    pending.code_sent_at = datetime.utcnow()
    pending.code_expires_at = expires_at
    db.add(pending)
    db.commit()
    db.refresh(pending)
    return pending


def delete_pending_registration(db: Session, pending: PendingUserRegistrationModel) -> None:
    db.delete(pending)
    db.commit()


def pending_contact_to_schema(
    pending: PendingUserRegistrationModel,
) -> ContactPreference:
    return ContactPreference(
        method=ContactMethod(pending.contact_method),
        value=decrypt_value(pending.contact_value_encrypted) or "",
        workspace=decrypt_value(pending.contact_workspace_encrypted),
        channel=decrypt_value(pending.contact_channel_encrypted),
    )


def pending_preferences_to_schema(
    pending: PendingUserRegistrationModel,
) -> UserPreferences:
    language = pending.preferences_language or "en"
    return UserPreferences(language=language)
