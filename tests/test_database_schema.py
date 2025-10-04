import sys
from importlib import import_module, reload
from pathlib import Path

from sqlalchemy import inspect, text


def test_init_db_adds_missing_purpose_column(tmp_path, monkeypatch):
    db_path = Path(tmp_path) / "legacy.db"
    monkeypatch.setenv("SQLITE_DB_PATH", str(db_path))
    monkeypatch.delenv("DATABASE_URL", raising=False)

    database_module = reload(import_module("backend.database"))
    sys.modules.pop("backend.models", None)
    import_module("backend.models")

    with database_module.engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE projects (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    risk VARCHAR(50),
                    documentation_status VARCHAR(50),
                    owner VARCHAR(255),
                    business_units JSON,
                    team JSON,
                    deployments JSON,
                    initial_risk_assessment JSON,
                    created_at TIMESTAMP WITH TIME ZONE,
                    updated_at TIMESTAMP WITH TIME ZONE
                )
                """
            )
        )

    database_module.init_db()

    inspector = inspect(database_module.engine)
    project_columns = {column["name"] for column in inspector.get_columns("projects")}
    assert "purpose" in project_columns
