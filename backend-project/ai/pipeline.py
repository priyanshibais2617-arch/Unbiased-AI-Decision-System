"""End-to-end fairness audit pipeline.

Layer covered:
8. Pipeline Orchestration (meta-layer)

Orchestrates all 7 core layers:
1. Data understanding and validation (preproccess)
2. Sensitive attribute analysis (grouping)
3. Bias detection metrics (bias_metrics)
4. Bias scoring (bias_score)
5. Feature-level bias detection (feature_bias)
6. Explainability (explainability)
7. Recommendations (recommmendation)
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

try:
    from .preproccess import prepare_audit_records, understand_dataset
    from .grouping import analyze_sensitive_attributes
    from .bias_metrics import calculate_bias_report
    from .bias_score import attach_bias_score, aggregate_bias_score
    from .feature_bias import audit_feature_bias, detect_feature_level_bias, problematic_columns
    from .explainability import build_explainability_report
    from .recommmendation import build_structured_recommendations
except ImportError:  # pragma: no cover
    from preproccess import prepare_audit_records, understand_dataset
    from grouping import analyze_sensitive_attributes
    from bias_metrics import calculate_bias_report
    from bias_score import attach_bias_score, aggregate_bias_score
    from feature_bias import audit_feature_bias, detect_feature_level_bias, problematic_columns
    from explainability import build_explainability_report
    from recommmendation import build_structured_recommendations


def run_audit(
    records: Iterable[dict[str, Any]],
    sensitive_attributes: list[str],
    outcome_column: str,
    thresholds: dict[str, float] | None = None,
) -> dict[str, Any]:
    """Run complete end-to-end fairness audit pipeline.

    Connects all 7 layers of the fairness audit system into one cohesive flow.
    Safely handles iterable/generator inputs by materializing to list upfront.

    Args:
        records: Input records (list or generator/iterable) with outcome column
        sensitive_attributes: List of protected attribute column names to analyze
        outcome_column: Name of the outcome/decision column (favorable value)
        thresholds: Optional dict with 'disparate_impact' and 'parity' thresholds

    Returns:
        Comprehensive audit report dict containing:
        - sensitive_attributes, outcome_column (metadata)
        - dataset_summary (row count, column types, missing values)
        - sensitive_analysis (group-level rates by attribute)
        - bias_metrics (scored fairness metrics per attribute)
        - aggregate_score (project-level fairness health and bias)
        - feature_level_bias (protected attribute fairness audits)
        - feature_reports (non-sensitive feature contribution scores)
        - problematic_columns (features with contribution >= 0.2)
        - explainability (feature influences, SHAP-style values)
        - structured_recommendations (actionable mitigation steps)
    """

    # Layer 0: Convert iterable to list for safe multi-pass iteration
    # This allows us to iterate through records multiple times across layers
    if not isinstance(records, list):
        records = list(records)

    # Layer 1: Data understanding and validation
    # Prepares records (normalizes strings, validates columns)
    audit_records = prepare_audit_records(records, outcome_column, sensitive_attributes)
    dataset_summary = understand_dataset(audit_records)

    # Layer 2: Sensitive attribute analysis
    # Splits records by protected attributes, calculates selection rates
    sensitive_analysis = analyze_sensitive_attributes(audit_records, sensitive_attributes, outcome_column)

    # Layer 3: Bias metrics detection
    # Computes statistical parity, disparate impact, demographic equivalence
    # Unpack thresholds dict if provided, otherwise use defaults
    threshold_kwargs = {}
    if thresholds:
        if "parity" in thresholds:
            threshold_kwargs["parity_threshold"] = thresholds["parity"]
        if "disparate_impact" in thresholds:
            threshold_kwargs["impact_threshold"] = thresholds["disparate_impact"]
    
    bias_metrics = calculate_bias_report(
        audit_records, sensitive_attributes, outcome_column, **threshold_kwargs
    )

    # Layer 4: Bias scoring
    # Converts metrics to 0-100 fairness health score and 0.0-1.0 bias score
    scored_metrics = [attach_bias_score(metric) for metric in bias_metrics]
    aggregate_score = aggregate_bias_score(scored_metrics)

    # Layer 5: Feature-level bias detection
    # Audits protected attributes for fairness, analyzes all features for contribution
    feature_audits = audit_feature_bias(audit_records, sensitive_attributes, outcome_column)
    feature_reports = detect_feature_level_bias(audit_records, outcome_column, sensitive_attributes)
    problematic = problematic_columns(feature_reports)

    # Layer 6: Explainability
    # Builds SHAP-style feature influence estimates, fairness explanations
    explainability_report = build_explainability_report(
        audit_records, outcome_column, scored_metrics, None, sensitive_attributes
    )

    # Layer 7: Recommendations
    # Generates actionable mitigation strategies for detected biases
    recommendations = build_structured_recommendations(scored_metrics)

    return {
        # Metadata
        "sensitive_attributes": sensitive_attributes,
        "outcome_column": outcome_column,
        # Layer 1 outputs
        "dataset_summary": dataset_summary,
        # Layer 2 outputs
        "sensitive_analysis": sensitive_analysis,
        # Layer 3-4 outputs
        "bias_metrics": scored_metrics,
        "aggregate_score": aggregate_score,
        # Layer 5 outputs
        "feature_level_bias": feature_audits,
        "feature_reports": feature_reports,
        "problematic_columns": problematic,
        # Layer 6 outputs
        "explainability": explainability_report,
        # Layer 7 outputs
        "structured_recommendations": recommendations,
    }


class FairnessPipeline:
    """Encapsulates the fairness audit pipeline as a reusable component."""

    def __init__(
        self,
        sensitive_attributes: list[str],
        outcome_column: str,
        thresholds: dict[str, float] | None = None,
    ) -> None:
        """Initialize pipeline with audit parameters.

        Args:
            sensitive_attributes: Protected attributes to analyze
            outcome_column: Favorable outcome column name
            thresholds: Optional fairness thresholds
        """
        self.sensitive_attributes = sensitive_attributes
        self.outcome_column = outcome_column
        self.thresholds = thresholds

    def run(self, records: Iterable[dict[str, Any]]) -> dict[str, Any]:
        """Execute the audit pipeline on provided records."""
        return run_audit(
            records, self.sensitive_attributes, self.outcome_column, self.thresholds
        )


if __name__ == "__main__":
    # Sample fairness audit
    sample_records = [
        {"name": "alice", "gender": "female", "age": 28, "income": "high", "decision": "approved"},
        {"name": "bob", "gender": "male", "age": 35, "income": "high", "decision": "approved"},
        {"name": "carol", "gender": "female", "age": 22, "income": "low", "decision": "rejected"},
        {"name": "david", "gender": "male", "age": 40, "income": "low", "decision": "approved"},
        {"name": "eve", "gender": "female", "age": 30, "income": "high", "decision": "approved"},
        {"name": "frank", "gender": "male", "age": 45, "income": "high", "decision": "approved"},
    ]

    result = run_audit(sample_records, ["gender"], "decision")
    print("=== Fairness Audit Pipeline Results ===\n")
    print(f"Dataset: {result['dataset_summary']}")
    print(f"\nAggregate Score: {result['aggregate_score']}")
    print(f"\nProblematic Columns: {result['problematic_columns']}")
    print(f"Recommendations for gender: {len(result['structured_recommendations'].get('gender', []))} items")
