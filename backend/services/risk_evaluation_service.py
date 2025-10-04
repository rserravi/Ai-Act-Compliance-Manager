from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Iterable, List


RiskAnswers = Dict[str, Any]


def _config_path() -> Path:
    # The risk wizard configuration currently lives in the frontend package.
    # We reuse it directly to ensure both client and server rely on the same
    # source of truth for rules.
    return (
        Path(__file__)
        .resolve()
        .parents[2]
        / "frontend"
        / "src"
        / "configs"
        / "risk-wizard.json"
    )


@lru_cache(maxsize=1)
def _load_result_step() -> Dict[str, Any]:
    config_file = _config_path()
    with config_file.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    steps: Iterable[Dict[str, Any]] = payload.get("wizard", {}).get("steps", [])
    for step in steps:
        if "rules" in step and "default" in step:
            return step
    raise ValueError("risk wizard configuration missing result step definition")


def _is_not_empty(value: Any) -> bool:
    if isinstance(value, str):
        return value.strip() != ""
    if isinstance(value, (list, tuple, set)):
        return len(value) > 0
    return value is not None and value is not False


def _matches_condition(expected: Any, answer: Any) -> bool:
    if expected == "not_empty":
        return _is_not_empty(answer)
    if isinstance(expected, list):
        if isinstance(answer, list):
            return any(item in answer for item in expected)
        return answer in expected
    return answer == expected


def _matches_rule(conditions: Dict[str, Any], answers: RiskAnswers) -> bool:
    for question_id, expected in conditions.items():
        if not _matches_condition(expected, answers.get(question_id)):
            return False
    return True


_OBLIGATIONS_MAP: Dict[str, List[str]] = {
    "alto": [
        "Realizar la evaluación de conformidad completa según el Anexo VI.",
        "Registrar el sistema en la base de datos de la UE antes de su puesta en el mercado.",
        "Implementar un sistema continuo de gestión de riesgos.",
        "Garantizar la gobernanza de los datos y su calidad durante entrenamiento y prueba.",
        "Asegurar niveles adecuados de supervisión humana y ciberseguridad.",
    ],
    "limitado": [
        "Informar claramente a los usuarios cuando interactúan con un sistema de IA.",
        "Etiquetar de forma visible el contenido generado o manipulado mediante IA.",
        "Revisar periódicamente si los casos de uso evolucionan hacia categorías de mayor riesgo.",
    ],
    "minimo": [
        "Adherirse voluntariamente a códigos de conducta para fomentar la confianza.",
        "Monitorizar el uso para detectar riesgos emergentes no contemplados inicialmente.",
        "No se requieren acciones obligatorias de cumplimiento.",
    ],
}


def evaluate_risk(answers: RiskAnswers) -> Dict[str, Any]:
    result_step = _load_result_step()
    rules = result_step.get("rules", [])

    for rule in rules:
        conditions = rule.get("if", {})
        if _matches_rule(conditions, answers):
            classification = rule.get("classification", "limitado")
            return {
                "classification": classification,
                "justification": rule.get("justification", ""),
                "obligations": _OBLIGATIONS_MAP.get(classification, []),
            }

    default_result = result_step.get("default", {})
    classification = default_result.get("classification", "limitado")
    return {
        "classification": classification,
        "justification": default_result.get("justification", ""),
        "obligations": _OBLIGATIONS_MAP.get(classification, []),
    }
