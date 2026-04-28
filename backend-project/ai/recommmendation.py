"""Bias mitigation recommendation engine.

Layer covered:
7. Recommendation Engine
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any


def _priority(metric: Mapping[str, Any]) -> str:
    band = metric.get("bias_band") or metric.get("bias_level") or metric.get("risk_level")
    if band == "high":
        return "high"
    if band == "medium":
        return "medium"
    return "low"


def structured_recommendations_for_metric(metric: Mapping[str, Any]) -> list[dict[str, Any]]:
    """Return actionable mitigation steps for one biased attribute."""

    attribute = str(metric.get("protected_attribute", "protected attribute"))
    impacted = str(metric.get("impacted_group") or "impacted group")
    privileged = str(metric.get("privileged_group") or "privileged group")
    priority = _priority(metric)
    passes_rule = bool(metric.get("passes_80_percent_rule", True))
    bias_score = float(metric.get("bias_score", metric.get("bias_value", 0.0)))

    actions: list[dict[str, Any]] = [
        {
            "action_type": "audit_feature_use",
            "priority": priority,
            "title": f"Review use of {attribute}",
            "reason": f"{attribute} may be directly or indirectly influencing decisions.",
            "steps": [
                f"Check whether {attribute} is used as an input feature.",
                f"Check proxy columns that may reveal {attribute}.",
                "Remove the sensitive feature from model training unless legally required and justified.",
            ],
        },
        {
            "action_type": "rebalance_dataset",
            "priority": priority,
            "title": f"Rebalance records for {impacted}",
            "reason": f"{impacted} has weaker favorable outcome rates than {privileged}.",
            "steps": [
                f"Increase representative samples for {impacted}.",
                "Compare label quality across all groups.",
                "Avoid training on historically skewed approvals without correction.",
            ],
        },
        {
            "action_type": "reweight_samples",
            "priority": priority,
            "title": "Apply sample reweighting",
            "reason": "Reweighting reduces the effect of overrepresented groups during training.",
            "steps": [
                f"Assign higher training weights to underrepresented or disadvantaged {attribute} groups.",
                "Retrain the model and rerun fairness metrics.",
                "Accept the model only if bias score improves.",
            ],
        },
    ]

    if not passes_rule:
        actions.append(
            {
                "action_type": "enforce_80_percent_rule",
                "priority": "high",
                "title": "Fix disparate impact before deployment",
                "reason": "The disparate impact ratio is below the 80 percent rule.",
                "steps": [
                    "Pause automated deployment for this decision flow.",
                    "Tune thresholds and retrain with mitigation.",
                    "Require human review until the ratio reaches the configured threshold.",
                ],
            }
        )

    if bias_score >= 0.4:
        actions.append(
            {
                "action_type": "human_review",
                "priority": "high",
                "title": "Route high-risk decisions to manual review",
                "reason": f"Bias score is {bias_score}, which is in the high range.",
                "steps": [
                    "Flag affected decisions for reviewer approval.",
                    "Document reviewer override reasons.",
                    "Monitor whether manual review changes group-level outcomes.",
                ],
            }
        )

    if priority == "low" and passes_rule:
        return [
            {
                "action_type": "monitoring",
                "priority": "low",
                "title": f"Continue monitoring {attribute}",
                "reason": "Current fairness metrics are within the accepted range.",
                "steps": [
                    "Track fairness metrics after every dataset refresh.",
                    "Keep human review available for high-impact decisions.",
                ],
            }
        ]

    return actions


def recommendations_for_metric(metric: Mapping[str, Any]) -> list[str]:
    """Return readable recommendation strings for UI compatibility."""

    return [
        f"{item['title']}: {' '.join(item['steps'])}"
        for item in structured_recommendations_for_metric(metric)
    ]


def build_recommendations(audits: list[Mapping[str, Any]]) -> dict[str, list[str]]:
    return {
        str(audit.get("protected_attribute", "unknown")): recommendations_for_metric(audit)
        for audit in audits
    }


def build_structured_recommendations(audits: Iterable[Mapping[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Return structured recommendations keyed by protected attribute."""

    return {
        str(audit.get("protected_attribute", "unknown")): structured_recommendations_for_metric(audit)
        for audit in audits
    }


if __name__ == "__main__":
    sample_audit = {
        "protected_attribute": "gender",
        "impacted_group": "female",
        "privileged_group": "male",
        "bias_score": 0.48,
        "bias_band": "high",
        "passes_80_percent_rule": False,
    }
    print(recommendations_for_metric(sample_audit))
    print(build_structured_recommendations([sample_audit]))
