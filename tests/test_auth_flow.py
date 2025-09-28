import os
import sys
from importlib import import_module, reload
from pathlib import Path
from tempfile import TemporaryDirectory

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import httpx  # noqa: F401 - ensure the local stub is registered before importing TestClient
from fastapi.testclient import TestClient

# Configure an isolated database and deterministic JWT secret for the test run
_TEMP_DIR = TemporaryDirectory()
os.environ["SQLITE_DB_PATH"] = str(Path(_TEMP_DIR.name) / "test.db")
os.environ["JWT_SECRET"] = "integration-test-secret"
os.environ["JWT_ALGORITHM"] = "HS256"

# Reload modules so that they pick up the testing configuration
_database_module = reload(import_module("backend.database"))
_main_module = reload(import_module("backend.main"))

from backend.repositories.pending_user_repository import get_pending_registration_by_id


def test_full_authentication_flow():
    client = TestClient(_main_module.app)

    payload = {
        "full_name": "Test User",
        "company": "Test Company",
        "email": "test.user@example.com",
        "contact": {
            "method": "email",
            "value": "test.user@example.com",
        },
        "avatar": None,
        "password": "Secure!Password1",
        "preferences": {"language": "en"},
    }

    init_response = client.post("/auth/sign-up/init", json=payload)
    assert init_response.status_code == 200
    init_data = init_response.json()
    registration_id = init_data["registration_id"]

    with _database_module.SessionLocal() as db:
        pending = get_pending_registration_by_id(db, registration_id)
        assert pending is not None
        verification_code = pending.verification_code

    verify_response = client.post(
        "/auth/sign-up/verify",
        json={"registration_id": registration_id, "code": verification_code},
    )
    assert verify_response.status_code == 200
    verify_data = verify_response.json()
    token = verify_data["token"]

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == payload["email"].lower()
