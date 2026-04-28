"""Feature-level bias detection.

Layer covered:
5. Feature-Level Bias Detection
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .bias_metrics import calculate_fairness_metrics
    from .bias_score import attach_bias_score, bias_band
    from .utils import is_favorable, normalize_text, safe_divide
except ImportError:  # pragma: no cover
    from bias_metrics import calculate_fairness_metrics
    from bias_score import attach_bias_score, bias_band
    from utils import is_favorable, normalize_text, safe_divide


def audit_feature_bias(
    records: Iterable[Mapping[str, Any]],
    protected_attributes: Iterable[str],
    outcome_field: str,
) -> list[dict[str, Any]]:
    """Run metrics for every protected feature and rank by fairness risk."""

    materialized = [dict(record) for record in records]
    audits = [
        attach_bias_score(calculate_fairness_metrics(materialized, attribute, outcome_field))
        for attribute in protected_attributes
    ]
    return sorted(audits, key=lambda item: item["bias_score"], reverse=True)


def most_biased_feature(audits: Iterable[Mapping[str, Any]]) -> str | None:
    ordered = sorted(audits, key=lambda item: float(item.get("bias_score", 0.0)), reverse=True)
    if not ordered:
        return None
    return str(ordered[0].get("protected_attribute"))


def _is_number_like(value: Any) -> bool:
    try:
        float(value)
    except (TypeError, ValueError):
        return False
    return not isinstance(value, bool)


def _feature_bucket(record: Mapping[str, Any], feature: str, numeric_medians: Mapping[str, float]) -> str:
    value = record.get(feature)
    if value is None or normalize_text(value) in {"", "na", "n/a", "none", "null", "nan"}:
        return "missing"
    if feature in numeric_medians and _is_number_like(value):
        return "high" if float(value) >= numeric_medians[feature] else "low"
    return normalize_text(value)


def _numeric_medians(records: list[dict[str, Any]], features: Iterable[str]) -> dict[str, float]:
    medians: dict[str, float] = {}
    for feature in features:
        values = sorted(float(record[feature]) for record in records if _is_number_like(record.get(feature)))
        if not values:
            continue
        middle = len(values) // 2
        if len(values) % 2:
            medians[feature] = values[middle]
        else:
            medians[feature] = (values[middle - 1] + values[middle]) / 2
    return medians


def feature_outcome_gap(
    records: Iterable[Mapping[str, Any]],
    feature: str,
    outcome_field: str,
) -> dict[str, Any]:
    """Measure how much a feature's values separate favorable outcomes."""

    materialized = [dict(record) for record in records]
    medians = _numeric_medians(materialized, (feature,))
    buckets: dict[str, dict[str, int]] = {}

    for record in materialized:
        bucket = _feature_bucket(record, feature, medians)
        buckets.setdefault(bucket, {"total": 0, "favorable": 0, "unfavorable": 0})
        buckets[bucket]["total"] += 1
        if is_favorable(record.get(outcome_field)):
            buckets[bucket]["favorable"] += 1
        else:
            buckets[bucket]["unfavorable"] += 1

    rates = {
        bucket: {
            **counts,
            "selection_rate": safe_divide(counts["favorable"], counts["total"]),
        }
        for bucket, counts in buckets.items()
    }
    selection_rates = [value["selection_rate"] for value in rates.values()]
    contribution_score = max(selection_rates) - min(selection_rates) if selection_rates else 0.0

    return {
        "feature": feature,
        "feature_type": "numeric" if feature in medians else "categorical",
        "buckets": rates,
        "contribution_score": round(contribution_score, 4),
        "bias_band": bias_band(contribution_score),
        "problematic": contribution_score >= 0.2,
    }


def detect_feature_level_bias(
    records: Iterable[Mapping[str, Any]],
    outcome_field: str,
    exclude_columns: Iterable[str] = (),
) -> list[dict[str, Any]]:
    """Rank columns by how strongly their values align with outcomes."""

    materialized = [dict(record) for record in records]
    if not materialized:
        return []

    excluded = {outcome_field, *exclude_columns}
    features = sorted({key for record in materialized for key in record if key not in excluded})
    reports = [feature_outcome_gap(materialized, feature, outcome_field) for feature in features]
    return sorted(reports, key=lambda item: item["contribution_score"], reverse=True)


def problematic_columns(feature_reports: Iterable[Mapping[str, Any]]) -> list[str]:
    """Return columns whose contribution score suggests feature-level bias."""

    return [
        str(report.get("feature"))
        for report in feature_reports
        if bool(report.get("problematic"))
    ]


if __name__ == "__main__":
    sample_records = [
        {"gender": "female", "income": 30000, "city": "rural", "decision": "rejected"},
        {"gender": "female", "income": 45000, "city": "rural", "decision": "approved"},
        {"gender": "male", "income": 90000, "city": "urban", "decision": "approved"},
        {"gender": "male", "income": 80000, "city": "urban", "decision": "approved"},
    ]
    sensitive_audits = audit_feature_bias(sample_records, ("gender",), "decision")
    feature_reports = detect_feature_level_bias(sample_records, "decision", exclude_columns=("gender",))
    print(sensitive_audits)
    print(feature_reports)
    print(problematic_columns(feature_reports))
