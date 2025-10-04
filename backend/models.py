from datetime import datetime, timezone
from functools import partial
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def generate_uuid() -> str:
    return str(uuid4())


utc_now = partial(datetime.now, timezone.utc)


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    preferences_language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    contact: Mapped[Optional["ContactPreferenceModel"]] = relationship(
        "ContactPreferenceModel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ContactPreferenceModel(Base):
    __tablename__ = "user_contact_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    method: Mapped[str] = mapped_column(String(50), nullable=False)
    value_encrypted: Mapped[str] = mapped_column(String(1024), nullable=False)
    workspace_encrypted: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    channel_encrypted: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    user: Mapped[UserModel] = relationship("UserModel", back_populates="contact")


class PendingUserRegistrationModel(Base):
    __tablename__ = "pending_user_registrations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_method: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_value_encrypted: Mapped[str] = mapped_column(String(1024), nullable=False)
    contact_workspace_encrypted: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    contact_channel_encrypted: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    preferences_language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    verification_code: Mapped[str] = mapped_column(String(32), nullable=False)
    code_sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    code_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class ProjectModel(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    risk: Mapped[str | None] = mapped_column(String(50), nullable=True)
    documentation_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    purpose: Mapped[str | None] = mapped_column(String(512), nullable=True)
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_units: Mapped[List[str] | None] = mapped_column(JSON, nullable=True)
    team: Mapped[List[str] | None] = mapped_column(JSON, nullable=True)
    deployments: Mapped[List[str] | None] = mapped_column(JSON, nullable=True)
    initial_risk_assessment: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    risk_assessments: Mapped[List["RiskAssessmentModel"]] = relationship(
        "RiskAssessmentModel",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class RiskAssessmentModel(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    classification: Mapped[str] = mapped_column(String(50), nullable=False)
    justification: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    project: Mapped[ProjectModel] = relationship("ProjectModel", back_populates="risk_assessments")
