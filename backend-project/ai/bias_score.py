"""Bias scoring system.

Layer covered:
4. Bias Scoring System
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .utils import clamp
except ImportError:  # pragma: no cover
    from utils import clamp


LOW_BIAS_MAX = 0.2
MEDIUM_BIAS_MAX = 0.4


def score_from_metrics(metrics: Mapping[str, Any]) -> float:
    """Convert fairness metrics into a 0-100 health score."""

    gap = abs(float(metrics.get("demographic_equivalence_gap", 0.0)))
    impact = float(metrics.get("disparate_impact_ratio", 1.0))
    parity = abs(float(metrics.get("statistical_parity_difference", 0.0)))

    gap_score = 1.0 - clamp(gap)
    parity_score = 1.0 - clamp(parity)
    impact_score = clamp(impact / 0.8) if impact < 0.8 else 1.0

    return round(((gap_score * 0.35) + (parity_score * 0.35) + (impact_score * 0.30)) * 100, 2)


def bias_score_from_metrics(metrics: Mapping[str, Any]) -> float:
    """Convert raw metrics into a single 0.0-1.0 bias score.

    Guide:
    low bias is close to 0.05
    medium bias is around 0.2
    high bias is 0.4+
    """

    if "bias_value" in metrics:
        return round(clamp(float(metrics["bias_value"])), 4)

    gap = abs(float(metrics.get("demographic_equivalence_gap", 0.0)))
    parity = abs(float(metrics.get("statistical_parity_difference", 0.0)))
    impact = float(metrics.get("disparate_impact_ratio", 1.0))
    impact_penalty = max(0.0, 0.8 - impact)

    return round(clamp((gap * 0.35) + (parity * 0.35) + (impact_penalty * 0.75)), 4)


def bias_band(score: float) -> str:
    """Return low, medium, or high for a 0.0-1.0 bias score."""

    if score >= MEDIUM_BIAS_MAX:
        return "high"
    if score >= LOW_BIAS_MAX:
        return "medium"
    return "low"


def risk_level(score: float) -> str:
    """Return risk level from a 0-100 fairness health score."""

    if score >= 90:
        return "low"
    if score >= 75:
        return "medium"
    return "high"


def score_summary(bias_score: float, fairness_score: float) -> str:
    band = bias_band(bias_score)
    if band == "high":
        return f"High bias detected ({bias_score}); fairness health is {fairness_score}/100."
    if band == "medium":
        return f"Moderate bias detected ({bias_score}); fairness health is {fairness_score}/100."
    return f"Low bias detected ({bias_score}); fairness health is {fairness_score}/100."


def attach_bias_score(metrics: Mapping[str, Any]) -> dict[str, Any]:
    """Attach both machine-friendly and user-friendly scoring fields."""

    scored = dict(metrics)
    fairness_score = score_from_metrics(metrics)
    bias_score = bias_score_from_metrics(metrics)

    scored["fairness_score"] = fairness_score
    scored["bias_score"] = bias_score
    scored["bias_band"] = bias_band(bias_score)
    scored["risk_level"] = risk_level(fairness_score)
    scored["passes_80_percent_rule"] = float(metrics.get("disparate_impact_ratio", 1.0)) >= 0.8
    scored["score_summary"] = score_summary(bias_score, fairness_score)
    return scored


def aggregate_bias_score(scored_metrics: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    """Create a single project-level score from multiple metric reports."""

    metrics = list(scored_metrics)
    if not metrics:
        return {
            "average_bias_score": 0.0,
            "max_bias_score": 0.0,
            "overall_bias_band": "low",
            "average_fairness_score": 100.0,
        }

    bias_scores = [float(metric.get("bias_score", bias_score_from_metrics(metric))) for metric in metrics]
    fairness_scores = [float(metric.get("fairness_score", score_from_metrics(metric))) for metric in metrics]
    max_bias = max(bias_scores)

    return {
        "average_bias_score": round(sum(bias_scores) / len(bias_scores), 4),
        "max_bias_score": round(max_bias, 4),
        "overall_bias_band": bias_band(max_bias),
        "average_fairness_score": round(sum(fairness_scores) / len(fairness_scores), 2),
    }


if __name__ == "__main__":
    sample_metrics = {
        "statistical_parity_difference": -0.5,
        "disparate_impact_ratio": 0.5,
        "demographic_equivalence_gap": 0.5,
        "bias_value": 0.48,
    }
    scored = attach_bias_score(sample_metrics)
    print(scored)
    print(aggregate_bias_score([scored]))
