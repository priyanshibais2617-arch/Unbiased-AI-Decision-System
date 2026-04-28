"""Data understanding and validation for fairness audits.

Layer covered:
1. Data Understanding
8. Consistency & Validation Layer

The filename keeps the project's current spelling for compatibility.
"""

from __future__ import annotations

import csv
import json
from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any

try:
    from .utils import Record, as_records, normalize_text, require_fields
except ImportError:  # pragma: no cover
    from utils import Record, as_records, normalize_text, require_fields


DEFAULT_PROTECTED_ATTRIBUTES = ("gender", "caste", "location", "age_group", "income_group")
MISSING_VALUES = {"", "na", "n/a", "none", "null", "nan", "-"}


def read_dataset(path: str | Path) -> list[Record]:
    """Read a CSV or JSON dataset into a list of records."""

    dataset_path = Path(path)
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")

    suffix = dataset_path.suffix.lower()
    if suffix == ".csv":
        with dataset_path.open("r", encoding="utf-8-sig", newline="") as file:
            return [dict(row) for row in csv.DictReader(file)]

    if suffix == ".json":
        with dataset_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        if isinstance(data, list):
            return [dict(row) for row in data]
        if isinstance(data, dict) and isinstance(data.get("records"), list):
            return [dict(row) for row in data["records"]]
        raise ValueError("JSON dataset must be a list of objects or contain a 'records' list.")

    raise ValueError("Unsupported dataset format. Use .csv or .json.")


def is_missing(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return normalize_text(value) in MISSING_VALUES
    return False


def is_number_like(value: Any) -> bool:
    if is_missing(value) or isinstance(value, bool):
        return False
    try:
        float(value)
    except (TypeError, ValueError):
        return False
    return True


def understand_dataset(records: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    """Identify numerical columns, categorical columns, and missing values."""

    materialized = as_records(records)
    if not materialized:
        raise ValueError("Dataset is empty.")

    columns = sorted({key for record in materialized for key in record})
    missing_values = {
        column: sum(1 for record in materialized if is_missing(record.get(column)))
        for column in columns
    }

    numerical_columns: list[str] = []
    categorical_columns: list[str] = []
    for column in columns:
        non_missing = [record.get(column) for record in materialized if not is_missing(record.get(column))]
        if non_missing and all(is_number_like(value) for value in non_missing):
            numerical_columns.append(column)
        else:
            categorical_columns.append(column)

    return {
        "row_count": len(materialized),
        "column_count": len(columns),
        "columns": columns,
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_columns,
        "missing_values": missing_values,
        "has_missing_values": any(count > 0 for count in missing_values.values()),
    }


def validate_audit_inputs(
    records: Iterable[Mapping[str, Any]],
    target_column: str,
    sensitive_columns: Iterable[str],
) -> list[Record]:
    """Check invalid inputs, missing columns, and incorrect target setup."""

    materialized = as_records(records)
    if not materialized:
        raise ValueError("Dataset is empty.")

    sensitive = list(sensitive_columns)
    if not target_column:
        raise ValueError("Target column is required.")
    if not sensitive:
        raise ValueError("At least one sensitive column is required.")

    columns = {key for record in materialized for key in record}
    missing_columns = [column for column in [target_column, *sensitive] if column not in columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    target_values = [record.get(target_column) for record in materialized if not is_missing(record.get(target_column))]
    if not target_values:
        raise ValueError(f"Target column '{target_column}' has no valid values.")
    if len({normalize_text(value) for value in target_values}) < 2:
        raise ValueError(f"Target column '{target_column}' must contain at least two outcome classes.")

    for column in sensitive:
        valid_values = [record.get(column) for record in materialized if not is_missing(record.get(column))]
        if len({normalize_text(value) for value in valid_values}) < 2:
            raise ValueError(f"Sensitive column '{column}' must contain at least two groups.")

    return materialized


def clean_records(
    records: Iterable[Mapping[str, Any]],
    required_fields: Iterable[str] = (),
) -> list[Record]:
    """Normalize string values and validate required fields."""

    materialized = as_records(records)
    if required_fields:
        require_fields(materialized, required_fields)

    cleaned: list[Record] = []
    for record in materialized:
        cleaned.append(
            {
                key: normalize_text(value) if isinstance(value, str) else value
                for key, value in record.items()
            }
        )
    return cleaned


def remove_protected_attributes(
    record: Mapping[str, Any],
    protected_attributes: Iterable[str] = DEFAULT_PROTECTED_ATTRIBUTES,
) -> Record:
    """Return model features without sensitive attributes."""

    protected = set(protected_attributes)
    return {key: value for key, value in record.items() if key not in protected}


def prepare_audit_records(
    records: Iterable[Mapping[str, Any]],
    outcome_field: str,
    protected_attributes: Iterable[str] = DEFAULT_PROTECTED_ATTRIBUTES,
) -> list[Record]:
    attributes = list(protected_attributes)
    validated = validate_audit_inputs(records, outcome_field, attributes)
    return clean_records(validated, required_fields=[outcome_field, *attributes])


if __name__ == "__main__":
    sample_records = [
        {"gender": "female", "caste": "general", "score": "78", "decision": "approved"},
        {"gender": "male", "caste": "obc", "score": "91", "decision": "approved"},
        {"gender": "female", "caste": "general", "score": "", "decision": "rejected"},
    ]
    print(understand_dataset(sample_records))
    print(prepare_audit_records(sample_records, "decision", ("gender", "caste")))
