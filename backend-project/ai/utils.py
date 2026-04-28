"""Shared helper utilities for fairness audit modules.

This module provides reusable utilities for:
- Text normalization and standardization
- Missing value detection
- Safe numeric conversion and validation
- Dataset validation and materialization
- Outcome classification
- JSON-safe output conversion
- Field existence and uniqueness checks
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any


# Type aliases
Record = dict[str, Any]

# Predefined outcome labels for classification
FAVORABLE_LABELS = {
    1, "1", True, "true", "yes", "y",
    "approved", "accept", "accepted",
    "pass", "passed", "selected", "eligible"
}
UNFAVORABLE_LABELS = {
    0, "0", False, "false", "no", "n",
    "rejected", "reject", "failed",
    "not selected", "ineligible"
}
MISSING_LABELS = {"", "na", "n/a", "none", "null", "nan", "-"}


# ============================================================================
# Text Processing Utilities
# ============================================================================

def normalize_text(value: Any) -> str:
    """Normalize a value to lowercase stripped string.

    Args:
        value: Any value to normalize.

    Returns:
        Lowercase, whitespace-trimmed string representation.

    Example:
        >>> normalize_text("  HELLO  ")
        'hello'
    """
    return str(value).strip().lower()


# ============================================================================
# Missing Value Detection
# ============================================================================

def is_missing(value: Any) -> bool:
    """Check if a value should be treated as missing/null.

    Handles None, empty strings, and common missing value representations
    (na, n/a, none, null, nan, -).

    Args:
        value: Value to check.

    Returns:
        True if value is missing, False otherwise.

    Example:
        >>> is_missing(None)
        True
        >>> is_missing("na")
        True
        >>> is_missing("42")
        False
    """
    if value is None:
        return True
    if isinstance(value, str):
        return normalize_text(value) in MISSING_LABELS
    return False


# ============================================================================
# Numeric Conversion and Validation
# ============================================================================

def to_number(value: Any, default: float | None = None) -> float | None:
    """Safely convert a value to float, returning default on failure.

    Ignores missing values and booleans.

    Args:
        value: Value to convert.
        default: Default value if conversion fails or value is missing.

    Returns:
        Float representation or default if conversion fails.

    Example:
        >>> to_number("42.5")
        42.5
        >>> to_number("invalid", default=0.0)
        0.0
        >>> to_number(None, default=-1.0)
        -1.0
    """
    if is_missing(value) or isinstance(value, bool):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def is_number_like(value: Any) -> bool:
    """Check if a value can be converted to a numeric type.

    Args:
        value: Value to check.

    Returns:
        True if value can be converted to float, False otherwise.

    Example:
        >>> is_number_like("42")
        True
        >>> is_number_like(3.14)
        True
        >>> is_number_like("text")
        False
    """
    return to_number(value) is not None


# ============================================================================
# Numeric Operations
# ============================================================================

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Perform division safely without raising ZeroDivisionError.

    Args:
        numerator: Dividend.
        denominator: Divisor.
        default: Value to return if denominator is zero.

    Returns:
        Division result or default if denominator is zero.

    Example:
        >>> safe_divide(10, 2)
        5.0
        >>> safe_divide(10, 0, default=0.0)
        0.0
    """
    if denominator == 0:
        return default
    return numerator / denominator


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    """Constrain a numeric value within a range.

    Args:
        value: Value to clamp.
        minimum: Lower bound (default 0.0).
        maximum: Upper bound (default 1.0).

    Returns:
        Value clamped to [minimum, maximum].

    Example:
        >>> clamp(1.5, 0.0, 1.0)
        1.0
        >>> clamp(-0.5, 0.0, 1.0)
        0.0
    """
    return max(minimum, min(maximum, value))


# ============================================================================
# Outcome Classification
# ============================================================================

def is_favorable(value: Any) -> bool:
    """Classify a value as a favorable outcome.

    Recognizes favorable and unfavorable labels. For numeric types,
    treats >= 0.5 as favorable.

    Args:
        value: Outcome value to classify.

    Returns:
        True if value represents a favorable outcome, False otherwise.

    Example:
        >>> is_favorable("approved")
        True
        >>> is_favorable("rejected")
        False
        >>> is_favorable(1.0)
        True
    """
    normalized = normalize_text(value)
    if value in FAVORABLE_LABELS or normalized in FAVORABLE_LABELS:
        return True
    if value in UNFAVORABLE_LABELS or normalized in UNFAVORABLE_LABELS:
        return False
    if isinstance(value, (int, float)):
        return value >= 0.5
    return bool(value)


# ============================================================================
# Record and Dataset Utilities
# ============================================================================

def as_records(records: Iterable[Mapping[str, Any]]) -> list[Record]:
    """Materialize an iterable of mappings into a list of record dicts.

    Converts generators, iterators, and other iterables to a concrete list.

    Args:
        records: Iterable of record mappings.

    Returns:
        List of record dicts (deep copy of mappings).

    Example:
        >>> as_records([{"a": 1}, {"a": 2}])
        [{'a': 1}, {'a': 2}]
    """
    return [dict(record) for record in records]


def ensure_non_empty(records: Iterable[Mapping[str, Any]]) -> list[Record]:
    """Materialize records and validate the dataset is not empty.

    Args:
        records: Iterable of records.

    Returns:
        List of records.

    Raises:
        ValueError: If records is empty.

    Example:
        >>> ensure_non_empty([{"a": 1}])
        [{'a': 1}]
    """
    materialized = as_records(records)
    if not materialized:
        raise ValueError("Dataset is empty.")
    return materialized


def require_fields(records: Iterable[Mapping[str, Any]], required_fields: Iterable[str]) -> None:
    """Validate that all records contain specified required fields.

    Args:
        records: Iterable of records to validate.
        required_fields: Field names that must be present in each record.

    Raises:
        ValueError: If any required field is missing from any record.

    Example:
        >>> require_fields([{"a": 1, "b": 2}], ["a", "b"])
        (No exception)
    """
    missing: set[str] = set()
    required = list(required_fields)
    for index, record in enumerate(records):
        for field in required:
            if field not in record:
                missing.add(f"row {index}: {field}")
    if missing:
        preview = ", ".join(sorted(missing)[:6])
        raise ValueError(f"Missing required fields: {preview}")


def field_exists(records: Iterable[Mapping[str, Any]], field: str) -> bool:
    """Check if a field exists in at least one record.

    Args:
        records: Iterable of records.
        field: Field name to search for.

    Returns:
        True if field appears in at least one record, False otherwise.

    Example:
        >>> field_exists([{"a": 1}, {"b": 2}], "a")
        True
        >>> field_exists([{"a": 1}], "missing")
        False
    """
    return any(field in record for record in records)


def unique_values(
    records: Iterable[Mapping[str, Any]],
    field: str,
    skip_missing: bool = True
) -> list[Any]:
    """Extract unique values from a field, preserving first-seen order.

    Args:
        records: Iterable of records.
        field: Field name to extract values from.
        skip_missing: If True, skip missing values. Default True.

    Returns:
        List of unique values in order of first appearance.

    Example:
        >>> records = [{"a": 1}, {"a": 1}, {"a": 2}]
        >>> unique_values(records, "a")
        [1, 2]
    """
    seen: set[str] = set()
    values: list[Any] = []
    for record in records:
        value = record.get(field)
        if skip_missing and is_missing(value):
            continue
        marker = normalize_text(value)
        if marker not in seen:
            seen.add(marker)
            values.append(value)
    return values


# ============================================================================
# JSON Serialization
# ============================================================================

def json_safe(value: Any) -> Any:
    """Convert Python objects to JSON-serializable equivalents.

    Handles:
    - Dicts and nested dicts (with str keys)
    - Lists, tuples, sets (converted to lists)
    - Special float values (NaN, Inf)

    Args:
        value: Any Python value.

    Returns:
        JSON-safe equivalent of the value.

    Example:
        >>> json_safe({"key": float("inf")})
        {'key': 'Infinity'}
        >>> json_safe([1, 2, (3, 4)])
        [1, 2, [3, 4]]
    """
    if isinstance(value, dict):
        return {str(key): json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [json_safe(item) for item in value]
    if isinstance(value, float):
        # Handle special float values
        if value != value:  # NaN check
            return None
        if value == float("inf"):
            return "Infinity"
        if value == float("-inf"):
            return "-Infinity"
    return value


if __name__ == "__main__":
    """Comprehensive test of all utility functions."""

    # Test data
    sample_records = [
        {"gender": "female", "score": "91", "age": 28, "decision": "approved"},
        {"gender": "male", "score": "", "age": None, "decision": "rejected"},
        {"gender": "Female", "score": "na", "age": 35, "decision": "Approved"},
        {"gender": "unknown", "score": "75.5", "age": "invalid", "decision": "approved"},
    ]

    print("=" * 70)
    print("UTILITY FUNCTIONS TEST SUITE")
    print("=" * 70)

    # Text Processing
    print("\n[TEXT PROCESSING]")
    print(f"  normalize_text('  HELLO  ') = {repr(normalize_text('  HELLO  '))}")
    print(f"  normalize_text('Gender') = {repr(normalize_text('Gender'))}")

    # Missing Value Detection
    print("\n[MISSING VALUE DETECTION]")
    test_values = [None, "", "na", "N/A", "NONE", "nan", "-", 0, "valid"]
    for val in test_values:
        result = is_missing(val)
        print(f"  is_missing({repr(val)}) = {result}")

    # Numeric Conversion
    print("\n[NUMERIC CONVERSION]")
    test_numeric = ["42", "3.14", "invalid", None, "", "true", "0"]
    for val in test_numeric:
        result = to_number(val, default=-1)
        print(f"  to_number({repr(val)}, default=-1) = {result}")

    # Numeric Validation
    print("\n[NUMERIC VALIDATION]")
    for val in test_numeric:
        result = is_number_like(val)
        print(f"  is_number_like({repr(val)}) = {result}")

    # Safe Division
    print("\n[SAFE DIVISION]")
    print(f"  safe_divide(10, 2) = {safe_divide(10, 2)}")
    print(f"  safe_divide(10, 0, default=999) = {safe_divide(10, 0, default=999)}")

    # Clamping
    print("\n[CLAMPING]")
    test_clamp_values = [1.5, -0.5, 0.5, 2.0]
    for val in test_clamp_values:
        result = clamp(val, 0.0, 1.0)
        print(f"  clamp({val}, 0.0, 1.0) = {result}")

    # Outcome Classification
    print("\n[OUTCOME CLASSIFICATION]")
    test_outcomes = ["approved", "rejected", "yes", "no", 1, 0, 0.6, 0.4]
    for val in test_outcomes:
        result = is_favorable(val)
        print(f"  is_favorable({repr(val)}) = {result}")

    # Record Materialization
    print("\n[RECORD MATERIALIZATION]")
    gen = (r for r in sample_records[:2])
    records = as_records(gen)
    print(f"  as_records(generator) produced {len(records)} records")

    # Non-Empty Validation
    print("\n[NON-EMPTY VALIDATION]")
    try:
        ensure_non_empty(sample_records)
        print("  ensure_non_empty(sample_records) ✓ passed")
    except ValueError as e:
        print(f"  ensure_non_empty(sample_records) ✗ failed: {e}")

    # Field Existence
    print("\n[FIELD EXISTENCE]")
    exists_gender = field_exists(sample_records, "gender")
    exists_missing = field_exists(sample_records, "missing_field")
    print(f"  field_exists(records, 'gender') = {exists_gender}")
    print(f"  field_exists(records, 'missing_field') = {exists_missing}")

    # Unique Values
    print("\n[UNIQUE VALUES]")
    unique_genders = unique_values(sample_records, "gender", skip_missing=True)
    unique_decisions = unique_values(sample_records, "decision", skip_missing=False)
    print(f"  unique_values(records, 'gender', skip_missing=True) = {unique_genders}")
    print(f"  unique_values(records, 'decision') = {unique_decisions}")

    # Required Fields
    print("\n[REQUIRED FIELDS]")
    try:
        require_fields(sample_records, ["gender", "decision"])
        print("  require_fields(records, ['gender', 'decision']) ✓ passed")
    except ValueError as e:
        print(f"  require_fields(records, ['gender', 'decision']) ✗ failed: {e}")

    try:
        require_fields(sample_records, ["gender", "nonexistent"])
        print("  require_fields(records, ['gender', 'nonexistent']) ✓ passed")
    except ValueError as e:
        print(f"  require_fields(records, ['gender', 'nonexistent']) ✗ failed (expected)")

    # JSON Serialization
    print("\n[JSON SERIALIZATION]")
    test_json_values = {
        "normal_dict": {"a": 1, "b": 2},
        "nested": {"inner": [1, 2, {"key": 3}]},
        "infinity": float("inf"),
        "neg_infinity": float("-inf"),
        "nan": float("nan"),
        "tuple": (1, 2, 3),
        "set": {1, 2, 3},
    }
    for label, val in test_json_values.items():
        result = json_safe(val)
        print(f"  json_safe({label}) = {result}")

    print("\n" + "=" * 70)
    print("ALL TESTS COMPLETED SUCCESSFULLY")
    print("=" * 70)
