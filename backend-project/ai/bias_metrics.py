"""Bias detection metrics used by the Unbiased AI decision pipeline.

Layer covered:
3. Bias Detection Engine
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .grouping import group_rates, reference_groups
    from .utils import clamp, safe_divide
except ImportError:  # pragma: no cover
    from grouping import group_rates, reference_groups
    from utils import clamp, safe_divide


DEFAULT_DISPARATE_IMPACT_THRESHOLD = 0.8
DEFAULT_PARITY_THRESHOLD = 0.1


def statistical_parity_difference(rates: Mapping[str, Mapping[str, float]]) -> float:
    """Difference between lowest and highest favorable outcome rates."""

    if not rates:
        return 0.0
    values = [group["selection_rate"] for group in rates.values()]
    return min(values) - max(values)


def disparate_impact_ratio(rates: Mapping[str, Mapping[str, float]]) -> float:
    """Ratio between lowest and highest favorable outcome rates."""

    if not rates:
        return 1.0
    values = [group["selection_rate"] for group in rates.values()]
    return safe_divide(min(values), max(values), default=1.0)


def demographic_equivalence_gap(rates: Mapping[str, Mapping[str, float]]) -> float:
    """Absolute spread between group selection rates."""

    if not rates:
        return 0.0
    values = [group["selection_rate"] for group in rates.values()]
    return max(values) - min(values)


def quantify_bias(
    statistical_parity: float,
    disparate_impact: float,
    parity_threshold: float = DEFAULT_PARITY_THRESHOLD,
    impact_threshold: float = DEFAULT_DISPARATE_IMPACT_THRESHOLD,
) -> float:
    """Convert raw metric violations into one bias quantity from 0.0 to 1.0.

    Low bias is near 0.05, medium bias is around 0.2, and high bias is 0.4+.
    """

    parity_violation = max(0.0, abs(statistical_parity) - parity_threshold)
    impact_violation = max(0.0, impact_threshold - disparate_impact)
    return round(clamp((parity_violation * 0.6) + (impact_violation * 0.8)), 4)


def bias_level(bias_value: float) -> str:
    """Classify quantified bias into low, medium, or high."""

    if bias_value >= 0.4:
        return "high"
    if bias_value >= 0.2:
        return "medium"
    return "low"


def detect_bias(
    statistical_parity: float,
    disparate_impact: float,
    parity_threshold: float = DEFAULT_PARITY_THRESHOLD,
    impact_threshold: float = DEFAULT_DISPARATE_IMPACT_THRESHOLD,
) -> bool:
    """Return True when fairness thresholds are violated."""

    return abs(statistical_parity) > parity_threshold or disparate_impact < impact_threshold


def interpret_bias(
    bias_detected: bool,
    statistical_parity: float,
    disparate_impact: float,
) -> str:
    """Create a compact interpretation of the metric result."""

    if not bias_detected:
        return "No material group bias detected under the configured thresholds."
    if disparate_impact < DEFAULT_DISPARATE_IMPACT_THRESHOLD:
        return "Bias detected because the disparate impact ratio is below the 80 percent rule."
    return "Bias detected because the statistical parity difference is above the allowed threshold."


def calculate_fairness_metrics(
    records: Iterable[Mapping[str, Any]],
    protected_attribute: str,
    outcome_field: str,
    parity_threshold: float = DEFAULT_PARITY_THRESHOLD,
    impact_threshold: float = DEFAULT_DISPARATE_IMPACT_THRESHOLD,
) -> dict[str, Any]:
    """Compute core group fairness metrics for one protected attribute."""

    rates = group_rates(records, protected_attribute, outcome_field)
    privileged_group, impacted_group = reference_groups(rates)
    statistical_parity = statistical_parity_difference(rates)
    disparate_impact = disparate_impact_ratio(rates)
    equivalence_gap = demographic_equivalence_gap(rates)
    bias_detected = detect_bias(statistical_parity, disparate_impact, parity_threshold, impact_threshold)
    bias_value = quantify_bias(statistical_parity, disparate_impact, parity_threshold, impact_threshold)

    return {
        "protected_attribute": protected_attribute,
        "group_rates": rates,
        "privileged_group": privileged_group,
        "impacted_group": impacted_group,
        "statistical_parity_difference": statistical_parity,
        "disparate_impact_ratio": disparate_impact,
        "demographic_equivalence_gap": equivalence_gap,
        "bias_detected": bias_detected,
        "bias_value": bias_value,
        "bias_level": bias_level(bias_value),
        "thresholds": {
            "statistical_parity_difference": parity_threshold,
            "disparate_impact_ratio": impact_threshold,
        },
        "interpretation": interpret_bias(bias_detected, statistical_parity, disparate_impact),
    }


def calculate_bias_report(
    records: Iterable[Mapping[str, Any]],
    protected_attributes: Iterable[str],
    outcome_field: str,
    parity_threshold: float = DEFAULT_PARITY_THRESHOLD,
    impact_threshold: float = DEFAULT_DISPARATE_IMPACT_THRESHOLD,
) -> list[dict[str, Any]]:
    """Compute bias metrics for all user-selected sensitive attributes."""

    materialized = [dict(record) for record in records]
    return [
        calculate_fairness_metrics(
            materialized,
            attribute,
            outcome_field,
            parity_threshold=parity_threshold,
            impact_threshold=impact_threshold,
        )
        for attribute in protected_attributes
    ]


if __name__ == "__main__":
    sample_records = [
        {"gender": "female", "caste": "general", "decision": "approved"},
        {"gender": "female", "caste": "general", "decision": "rejected"},
        {"gender": "male", "caste": "obc", "decision": "approved"},
        {"gender": "male", "caste": "obc", "decision": "approved"},
    ]
    print(calculate_bias_report(sample_records, ("gender", "caste"), "decision"))
