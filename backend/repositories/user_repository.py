from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import ContactPreferenceModel, UserModel
from backend.schemas import ContactMethod, ContactPreference, User, UserPreferences
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

    preferences = UserPreferences(language=model.preferences_language or "en")

    return User(
        id=model.id,
        company=model.company,
        full_name=model.full_name,
        email=model.email,
        contact=contact,
        avatar=model.avatar,
        preferences=preferences,
    )


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    result = get_user_model_by_id(db, user_id)
    if result is None:
        return None
    return _model_to_schema(result)


def get_user_model_by_id(db: Session, user_id: str) -> Optional[UserModel]:
    statement = select(UserModel).where(UserModel.id == user_id)
    return db.execute(statement).scalar_one_or_none()


def get_user_model_by_email(db: Session, email: str) -> Optional[UserModel]:
    normalized = email.lower()
    statement = select(UserModel).where(UserModel.email == normalized)
    return db.execute(statement).scalar_one_or_none()


def update_user_profile(
    db: Session,
    user: UserModel,
    *,
    full_name: str,
    company: Optional[str],
    contact: ContactPreference,
    preferences: UserPreferences,
) -> UserModel:
    user.full_name = full_name
    user.company = company
    user.preferences_language = preferences.language if preferences else None

    contact_model = user.contact
    if contact_model is None:
        contact_model = ContactPreferenceModel()
        user.contact = contact_model

    contact_model.method = contact.method.value
    contact_model.value_encrypted = encrypt_value(contact.value) or ""
    contact_model.workspace_encrypted = encrypt_value(contact.workspace)
    contact_model.channel_encrypted = encrypt_value(contact.channel)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_avatar(
    db: Session,
    user: UserModel,
    avatar_data_url: Optional[str],
) -> UserModel:
    user.avatar = avatar_data_url
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


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
    password_hash: Optional[str] = None,
    preferences: Optional[UserPreferences] = None,
) -> UserModel:
    if password and password_hash:
        raise ValueError("Provide either password or password_hash, not both")

    if password_hash is not None:
        hashed_password = password_hash
    elif password is not None:
        hashed_password = hash_password(password)
    else:
        hashed_password = None
    normalized_email = email.lower()
    user_model = UserModel(
        id=user_id,
        company=company,
        full_name=full_name,
        email=normalized_email,
        avatar=avatar,
        password_hash=hashed_password,
        preferences_language=preferences.language if preferences else None,
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
