import os
from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


def _build_sqlite_url() -> str:
    db_path = os.getenv("SQLITE_DB_PATH")
    if db_path:
        return f"sqlite:///{db_path}"
    default_path = os.path.join(os.path.dirname(__file__), "data.db")
    return f"sqlite:///{default_path}"


DATABASE_URL = os.getenv("DATABASE_URL") or _build_sqlite_url()

is_sqlite = DATABASE_URL.startswith("sqlite")

engine_arguments = {"future": True}
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine: Engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    **engine_arguments,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


def init_db() -> None:
    from . import models  # noqa: F401 - ensure models are imported

    Base.metadata.create_all(bind=engine)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
