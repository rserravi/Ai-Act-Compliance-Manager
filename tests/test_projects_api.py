import os
import sys
from importlib import import_module, reload
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Dict

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import httpx  # noqa: F401 - ensure the local stub is registered before importing TestClient
from fastapi.testclient import TestClient

_TEMP_DIR = TemporaryDirectory()
os.environ["SQLITE_DB_PATH"] = str(Path(_TEMP_DIR.name) / "test.db")
os.environ["JWT_SECRET"] = "integration-test-secret"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["DATABASE_URL"] = ""

_database_module = reload(import_module("backend.database"))
sys.modules.pop("backend.models", None)
import_module("backend.models")
_main_module = reload(import_module("backend.main"))


def _get_auth_headers(client: TestClient) -> Dict[str, str]:
    login_response = client.post(
        "/auth/login/sso",
        json={"company": "Test Company", "email": "projects@test.example", "provider": "test"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_projects_crud_flow():
    client = TestClient(_main_module.app)
    headers = _get_auth_headers(client)

    project_payload = {
        "id": "proj-123",
        "name": "Project Atlas",
        "role": "provider",
        "risk": "medium",
        "documentation_status": "in_progress",
        "business_units": ["Compliance"],
        "team": ["ana@example.com"],
    }

    create_response = client.post("/projects", json=project_payload, headers=headers)
    assert create_response.status_code == 200
    assert create_response.json() == project_payload

    list_response = client.get("/projects", headers=headers)
    assert list_response.status_code == 200
    projects = list_response.json()
    assert any(project["id"] == project_payload["id"] for project in projects)

    search_response = client.get(
        "/projects",
        params={"q": "atlas", "role": "provider", "risk": "medium", "doc": "in_progress"},
        headers=headers,
    )
    assert search_response.status_code == 200
    search_results = search_response.json()
    assert len(search_results) == 1
    assert search_results[0]["id"] == project_payload["id"]

    get_response = client.get(f"/projects/{project_payload['id']}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["name"] == project_payload["name"]

    update_payload = {"risk": "high", "team": ["ana@example.com", "ben@example.com"]}
    update_response = client.patch(
        f"/projects/{project_payload['id']}",
        json=update_payload,
        headers=headers,
    )
    assert update_response.status_code == 200
    update_data = update_response.json()
    assert update_data["risk"] == "high"
    assert update_data["team"] == ["ana@example.com", "ben@example.com"]

    # Ensure the updated project is reflected in subsequent reads
    final_response = client.get(f"/projects/{project_payload['id']}", headers=headers)
    assert final_response.status_code == 200
    final_data = final_response.json()
    assert final_data["risk"] == "high"
    assert len(final_data["team"]) == 2
