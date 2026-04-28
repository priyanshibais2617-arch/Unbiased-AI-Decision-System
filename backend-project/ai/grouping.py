"""Sensitive attribute grouping for fairness analysis.

Layer covered:
2. Sensitive Attribute Analysis
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .utils import is_favorable, safe_divide
except ImportError:  # pragma: no cover - allows running files directly
    from utils import is_favorable, safe_divide


def group_counts(
    records: Iterable[Mapping[str, Any]],
    protected_attribute: str,
    outcome_field: str,
) -> dict[str, dict[str, int]]:
    """Count favorable and unfavorable outcomes for each protected group."""

    grouped: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "favorable": 0, "unfavorable": 0})

    for record in records:
        group = str(record.get(protected_attribute, "Unknown")).strip() or "Unknown"
        grouped[group]["total"] += 1
        if is_favorable(record.get(outcome_field)):
            grouped[group]["favorable"] += 1
        else:
            grouped[group]["unfavorable"] += 1

    return dict(grouped)


def group_rates(
    records: Iterable[Mapping[str, Any]],
    protected_attribute: str,
    outcome_field: str,
) -> dict[str, dict[str, float]]:
    """Return per-group favorable rates with counts."""

    counts = group_counts(records, protected_attribute, outcome_field)
    return {
        group: {
            "total": values["total"],
            "favorable": values["favorable"],
            "unfavorable": values["unfavorable"],
            "selection_rate": safe_divide(values["favorable"], values["total"]),
        }
        for group, values in counts.items()
    }


def reference_groups(rates: Mapping[str, Mapping[str, float]]) -> tuple[str | None, str | None]:
    """Return the highest-rate and lowest-rate groups."""

    if not rates:
        return None, None

    ordered = sorted(rates.items(), key=lambda item: item[1]["selection_rate"])
    return ordered[-1][0], ordered[0][0]


def split_by_sensitive_attribute(
    records: Iterable[Mapping[str, Any]],
    sensitive_attribute: str,
) -> dict[str, list[dict[str, Any]]]:
    """Split dataset rows into groups for a sensitive attribute."""

    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        group = str(record.get(sensitive_attribute, "Unknown")).strip() or "Unknown"
        groups[group].append(dict(record))
    return dict(groups)


def analyze_sensitive_attribute(
    records: Iterable[Mapping[str, Any]],
    sensitive_attribute: str,
    outcome_field: str,
) -> dict[str, Any]:
    """Identify privileged and unprivileged groups for one sensitive attribute."""

    materialized = [dict(record) for record in records]
    grouped_records = split_by_sensitive_attribute(materialized, sensitive_attribute)
    rates = group_rates(materialized, sensitive_attribute, outcome_field)
    privileged_group, unprivileged_group = reference_groups(rates)

    return {
        "sensitive_attribute": sensitive_attribute,
        "group_count": len(grouped_records),
        "groups": sorted(grouped_records),
        "privileged_group": privileged_group,
        "unprivileged_group": unprivileged_group,
        "group_rates": rates,
        "group_sizes": {group: len(rows) for group, rows in grouped_records.items()},
    }


def analyze_sensitive_attributes(
    records: Iterable[Mapping[str, Any]],
    sensitive_attributes: Iterable[str],
    outcome_field: str,
) -> list[dict[str, Any]]:
    """Run sensitive attribute analysis for user-selected columns."""

    materialized = [dict(record) for record in records]
    return [
        analyze_sensitive_attribute(materialized, attribute, outcome_field)
        for attribute in sensitive_attributes
    ]


if __name__ == "__main__":
    sample_records = [
        {"gender": "female", "caste": "general", "decision": "approved"},
        {"gender": "female", "caste": "general", "decision": "rejected"},
        {"gender": "male", "caste": "obc", "decision": "approved"},
        {"gender": "male", "caste": "obc", "decision": "approved"},
    ]
    print(analyze_sensitive_attributes(sample_records, ("gender", "caste"), "decision"))
