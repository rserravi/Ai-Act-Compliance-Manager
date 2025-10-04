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

from backend.schemas import Deliverable, TeamMember

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


def test_project_subresources_use_project_id():
    client = TestClient(_main_module.app)
    headers = _get_auth_headers(client)

    _main_module.projects.clear()
    _main_module.risk_assessments.clear()
    _main_module.deliverables.clear()
    _main_module.tasks.clear()
    _main_module.evidences.clear()
    _main_module.technical_dossiers.clear()
    _main_module.teams.clear()
    _main_module.incidents.clear()

    project_id = "proj-sub-123"
    project_payload = {
        "id": project_id,
        "name": "Project Nebula",
        "role": "provider",
        "risk": "low",
        "documentation_status": "not_started",
        "business_units": ["AI"],
        "team": [],
    }

    create_response = client.post("/projects", json=project_payload, headers=headers)
    assert create_response.status_code == 200

    risk_payload = {
        "id": "risk-1",
        "project_id": project_id,
        "date": "2024-01-01",
        "classification": "low",
        "justification": "Initial assessment",
    }
    risk_response = client.post(
        f"/projects/{project_id}/risk", json=risk_payload, headers=headers
    )
    assert risk_response.status_code == 200
    assert risk_response.json()["project_id"] == project_id

    risk_list = client.get(f"/projects/{project_id}/risk", headers=headers)
    assert risk_list.status_code == 200
    risk_items = risk_list.json()
    assert len(risk_items) == 1
    assert risk_items[0]["project_id"] == project_id

    deliverable = Deliverable(id="deliv-1", project_id=project_id, name="Plan")
    _main_module.deliverables[project_id].append(deliverable)
    deliverables_response = client.get(
        f"/projects/{project_id}/deliverables", headers=headers
    )
    assert deliverables_response.status_code == 200
    deliverables_data = deliverables_response.json()
    assert len(deliverables_data) == 1
    assert deliverables_data[0]["project_id"] == project_id

    assign_response = client.post(
        f"/projects/{project_id}/deliverables/{deliverable.id}/assign",
        json={"assignee": "lead@example.com"},
        headers=headers,
    )
    assert assign_response.status_code == 200
    assert assign_response.json()["project_id"] == project_id

    task_payload = {
        "id": "task-1",
        "project_id": project_id,
        "title": "Prepare report",
        "status": "open",
        "assignee": "ana@example.com",
        "due_date": "2024-01-15",
    }
    task_response = client.post(
        f"/projects/{project_id}/tasks", json=task_payload, headers=headers
    )
    assert task_response.status_code == 200
    assert task_response.json()["project_id"] == project_id

    tasks_response = client.get(f"/projects/{project_id}/tasks", headers=headers)
    assert tasks_response.status_code == 200
    tasks_data = tasks_response.json()
    assert len(tasks_data) == 1
    assert tasks_data[0]["project_id"] == project_id

    dossier_response = client.get(
        f"/projects/{project_id}/technical-dossier", headers=headers
    )
    assert dossier_response.status_code == 200
    dossier_data = dossier_response.json()
    assert dossier_data["project_id"] == project_id

    updated_dossier_payload = {
        "project_id": project_id,
        "fields": {"summary": "Updated"},
    }
    update_dossier_response = client.put(
        f"/projects/{project_id}/technical-dossier",
        json=updated_dossier_payload,
        headers=headers,
    )
    assert update_dossier_response.status_code == 200
    assert update_dossier_response.json()["project_id"] == project_id

    team_member = TeamMember(
        id="tm-1", project_id=project_id, name="Ana", role="Lead"
    )
    _main_module.teams[project_id].append(team_member)
    team_response = client.get(f"/projects/{project_id}/team", headers=headers)
    assert team_response.status_code == 200
    team_data = team_response.json()
    assert len(team_data) == 1
    assert team_data[0]["project_id"] == project_id

    evidence_payload = {
        "id": "evid-1",
        "project_id": project_id,
        "type": "document",
        "date": "2024-01-10",
        "owner": "ana@example.com",
    }
    evidence_response = client.post(
        f"/projects/{project_id}/evidences",
        json=evidence_payload,
        headers=headers,
    )
    assert evidence_response.status_code == 200
    assert evidence_response.json()["project_id"] == project_id

    evidences_response = client.get(
        f"/projects/{project_id}/evidences", headers=headers
    )
    assert evidences_response.status_code == 200
    evidences_data = evidences_response.json()
    assert len(evidences_data) == 1
    assert evidences_data[0]["project_id"] == project_id

    incident_payload = {
        "id": "inc-1",
        "project_id": project_id,
        "severity": "high",
        "status": "open",
        "title": "Incident",
        "description": "Details",
    }
    incident_response = client.post(
        "/incidents", json=incident_payload, headers=headers
    )
    assert incident_response.status_code == 200
    assert incident_response.json()["project_id"] == project_id

    incidents_response = client.get(
        "/incidents", params={"project_id": project_id}, headers=headers
    )
    assert incidents_response.status_code == 200
    incidents_data = incidents_response.json()
    assert len(incidents_data) == 1
    assert incidents_data[0]["project_id"] == project_id
