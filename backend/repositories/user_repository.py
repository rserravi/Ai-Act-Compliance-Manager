from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import ContactPreferenceModel, UserModel
from backend.schemas import ContactMethod, ContactPreference, User
from backend.security import decrypt_value, encrypt_value, hash_password


def _model_to_schema(model: UserModel) -> User:
    contact_model = model.contact
    if contact_model is None:
        raise ValueError("User contact information is missing")

    contact = ContactPreference(
        method=ContactMethod(contact_model.method),
        value=decrypt_value(contact_model.value_encrypted) or "",
        workspace=decrypt_value(contact_model.workspace_encrypted),
        channel=decrypt_value(contact_model.channel_encrypted),
    )

    return User(
        id=model.id,
        company=model.company,
        full_name=model.full_name,
        email=model.email,
        contact=contact,
        avatar=model.avatar,
    )


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    statement = select(UserModel).where(UserModel.id == user_id)
    result = db.execute(statement).scalar_one_or_none()
    if result is None:
        return None
    return _model_to_schema(result)


def get_user_model_by_email(db: Session, email: str) -> Optional[UserModel]:
    normalized = email.lower()
    statement = select(UserModel).where(UserModel.email == normalized)
    return db.execute(statement).scalar_one_or_none()


def create_user(
    db: Session,
    *,
    user_id: str,
    company: Optional[str],
    full_name: str,
    email: str,
    avatar: Optional[str],
    contact: ContactPreference,
    password: Optional[str] = None,
) -> UserModel:
    normalized_email = email.lower()
    user_model = UserModel(
        id=user_id,
        company=company,
        full_name=full_name,
        email=normalized_email,
        avatar=avatar,
        password_hash=hash_password(password) if password else None,
    )

    contact_model = ContactPreferenceModel(
        method=contact.method.value,
        value_encrypted=encrypt_value(contact.value) or "",
        workspace_encrypted=encrypt_value(contact.workspace),
        channel_encrypted=encrypt_value(contact.channel),
    )

    user_model.contact = contact_model

    db.add(user_model)
    db.commit()
    db.refresh(user_model)
    return user_model


def update_user_company(db: Session, user: UserModel, company: Optional[str]) -> None:
    user.company = company
    db.add(user)
    db.commit()
    db.refresh(user)


def update_user_password(db: Session, user: UserModel, password: str) -> None:
    user.password_hash = hash_password(password)
    db.add(user)
    db.commit()
    db.refresh(user)


def model_to_schema(model: UserModel) -> User:
    return _model_to_schema(model)
