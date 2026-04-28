import os
import pandas as pd
from .database import db
from ai.pipeline import run_audit

async def run_bias_analysis(analysis_id: str):
    """
    Background service to execute the bias analysis for a given dataset.
    Moving this logic away from the API request cycle prevents timeouts
    and readies the application for asynchronous queue workers like Celery.
    """
    try:
        result = await db.analyses.update_one(
            {"analysis_id": analysis_id},
            {"$set": {"status": "running"}}
        )
        
        if result.matched_count == 0:
            print(f"Warning: Attempted to run missing analysis {analysis_id}")
            return

        analysis_doc = await db.analyses.find_one({"analysis_id": analysis_id})
        if not analysis_doc:
            raise ValueError("Analysis not found")

        dataset_doc = await db.datasets.find_one({"dataset_id": analysis_doc["dataset_id"]})
        if not dataset_doc:
            raise ValueError("Dataset not found")

        file_path = dataset_doc.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise ValueError("Dataset file is missing")

        df = pd.read_csv(file_path)
        records = df.where(pd.notnull(df), None).to_dict(orient="records")

        audit_result = run_audit(
            records=records,
            sensitive_attributes=analysis_doc["sensitive_columns"],
            outcome_column=analysis_doc["target_column"],
        )

        await db.analyses.update_one(
            {"analysis_id": analysis_id},
            {"$set": {
                "status": "completed",
                "result": audit_result
            }}
        )
    except Exception as e:
        await db.analyses.update_one(
            {"analysis_id": analysis_id},
            {"$set": {
                "status": "failed",
                "message": f"Execution encountered an error: {str(e)}"
            }}
        )
