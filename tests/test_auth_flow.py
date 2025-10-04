import os
import sys
from datetime import datetime, timedelta, timezone
from importlib import import_module, reload
from pathlib import Path
from tempfile import TemporaryDirectory

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import httpx  # noqa: F401 - ensure the local stub is registered before importing TestClient
from fastapi.testclient import TestClient
from jose import jwt

# Configure an isolated database and deterministic JWT secret for the test run
_TEMP_DIR = TemporaryDirectory()
os.environ["SQLITE_DB_PATH"] = str(Path(_TEMP_DIR.name) / "test.db")
os.environ["JWT_SECRET"] = "integration-test-secret"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["DATABASE_URL"] = ""

# Reload modules so that they pick up the testing configuration
_database_module = reload(import_module("backend.database"))
sys.modules.pop("backend.models", None)
import_module("backend.models")
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


def test_legacy_token_without_sub_claim_is_accepted():
    client = TestClient(_main_module.app)

    login_response = client.post(
        "/auth/login/sso",
        json={
            "email": "legacy@test.example",
            "provider": "test",
            "company": "Legacy Co",
        },
    )
    assert login_response.status_code == 200
    login_data = login_response.json()

    user = login_data["user"]
    legacy_payload = {
        "user_id": user["id"],
        "email": user["email"],
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    legacy_token = jwt.encode(
        legacy_payload,
        os.environ["JWT_SECRET"],
        algorithm=os.environ["JWT_ALGORITHM"],
    )

    headers = {"Authorization": f"Bearer {legacy_token}"}
    response = client.post("/risk-evaluations", json={"answers": {}}, headers=headers)

    assert response.status_code == 200


def test_invalid_token_falls_back_to_demo_user_when_allowed():
    client = TestClient(_main_module.app)

    response = client.post(
        "/risk-evaluations",
        json={"answers": {}},
        headers={"Authorization": "Bearer not-a-valid-token"},
    )

    assert response.status_code == 200
