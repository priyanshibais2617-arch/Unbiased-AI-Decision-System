"""Explainability engine for fairness audit results.

Layer covered:
6. Explainability Engine
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .feature_bias import detect_feature_level_bias
except ImportError:  # pragma: no cover
    from feature_bias import detect_feature_level_bias


def explain_metric(metric: Mapping[str, Any]) -> str:
    attribute = metric.get("protected_attribute", "protected feature")
    impacted = metric.get("impacted_group") or "the lowest selection-rate group"
    privileged = metric.get("privileged_group") or "the highest selection-rate group"
    score = metric.get("fairness_score", "unknown")
    impact = float(metric.get("disparate_impact_ratio", 1.0))

    if impact < 0.8:
        return (
            f"{attribute} needs review: {impacted} receives favorable outcomes less often "
            f"than {privileged}. Fairness score is {score}/100 and the 80 percent rule is not met."
        )

    return (
        f"{attribute} is within the accepted fairness range. {impacted} and {privileged} "
        f"show no critical disparate-impact issue. Fairness score is {score}/100."
    )


def build_explanations(audits: list[Mapping[str, Any]]) -> list[str]:
    return [explain_metric(audit) for audit in audits]


def normalize_shap_values(shap_values: Mapping[str, float]) -> list[dict[str, Any]]:
    """Convert SHAP values into sorted feature influence rows."""

    total = sum(abs(float(value)) for value in shap_values.values())
    rows = []
    for feature, value in shap_values.items():
        numeric_value = float(value)
        rows.append(
            {
                "feature": feature,
                "shap_value": round(numeric_value, 6),
                "direction": "positive" if numeric_value >= 0 else "negative",
                "importance": round(abs(numeric_value), 6),
                "importance_share": round(abs(numeric_value) / total, 4) if total else 0.0,
            }
        )
    return sorted(rows, key=lambda item: item["importance"], reverse=True)


def estimate_shap_style_values(
    records: Iterable[Mapping[str, Any]],
    outcome_field: str,
    exclude_columns: Iterable[str] = (),
) -> list[dict[str, Any]]:
    """Create dependency-free SHAP-style influence estimates.

    This is a fallback for environments where a trained model and SHAP package
    are not available. It uses feature outcome gaps as influence estimates.
    """

    reports = detect_feature_level_bias(records, outcome_field, exclude_columns)
    total = sum(float(report.get("contribution_score", 0.0)) for report in reports)
    influences = []
    for report in reports:
        score = float(report.get("contribution_score", 0.0))
        influences.append(
            {
                "feature": report.get("feature"),
                "shap_value": round(score, 6),
                "direction": "positive",
                "importance": round(score, 6),
                "importance_share": round(score / total, 4) if total else 0.0,
                "source": "estimated_feature_gap",
            }
        )
    return influences


def top_influencing_features(
    influences: Iterable[Mapping[str, Any]],
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Return the strongest feature drivers."""

    ordered = sorted(influences, key=lambda item: float(item.get("importance", 0.0)), reverse=True)
    return [dict(item) for item in ordered[:limit]]


def explain_feature_influence(influences: Iterable[Mapping[str, Any]], limit: int = 3) -> str:
    """Answer: Which features influenced decisions most?"""

    top_features = top_influencing_features(influences, limit)
    if not top_features:
        return "No feature influence could be calculated."

    parts = [
        f"{item.get('feature')} ({float(item.get('importance_share', 0.0)):.1%})"
        for item in top_features
    ]
    return "Most influential features: " + ", ".join(parts) + "."


def build_explainability_report(
    records: Iterable[Mapping[str, Any]],
    outcome_field: str,
    audits: Iterable[Mapping[str, Any]] = (),
    shap_values: Mapping[str, float] | None = None,
    exclude_columns: Iterable[str] = (),
) -> dict[str, Any]:
    """Build a complete explanation report for UI/API usage."""

    audit_list = [dict(audit) for audit in audits]
    if shap_values is not None:
        influences = normalize_shap_values(shap_values)
        influence_source = "provided_shap_values"
    else:
        influences = estimate_shap_style_values(records, outcome_field, exclude_columns)
        influence_source = "estimated_feature_gap"

    return {
        "influence_source": influence_source,
        "feature_influences": influences,
        "top_features": top_influencing_features(influences),
        "feature_explanation": explain_feature_influence(influences),
        "fairness_explanations": build_explanations(audit_list),
    }


if __name__ == "__main__":
    sample_records = [
        {"gender": "female", "income": 30000, "city": "rural", "decision": "rejected"},
        {"gender": "female", "income": 45000, "city": "rural", "decision": "approved"},
        {"gender": "male", "income": 90000, "city": "urban", "decision": "approved"},
        {"gender": "male", "income": 80000, "city": "urban", "decision": "approved"},
    ]
    print(build_explainability_report(sample_records, "decision", exclude_columns=("gender",)))
    print(normalize_shap_values({"income": 0.42, "city": -0.21, "education": 0.08}))
