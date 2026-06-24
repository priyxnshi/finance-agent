"""
Schemas describing the response of POST /upload-csv.

The upload is intentionally tolerant of partial failure: a CSV with 100 rows
where 3 are malformed will still import the other 97, and report exactly
which rows failed and why, instead of rejecting the whole file.
"""
from typing import Optional

from pydantic import BaseModel

from app.schemas.expense import ExpenseOut


class CSVRowError(BaseModel):
    row_number: int  # 1-indexed, counting the header as row 0
    error: str
    raw_data: Optional[dict] = None


class CSVUploadResult(BaseModel):
    total_rows: int
    imported_count: int
    failed_count: int
    auto_categorized: int = 0   # rows where ML filled in a blank category
    imported_expenses: list[ExpenseOut]
    errors: list[CSVRowError]
