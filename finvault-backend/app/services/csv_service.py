"""
CSV import service.

Expected CSV format — header row required, columns matched case-insensitively
and in any order:

    amount,category,date,description
    480,Food & Dining,2026-06-19,Blue Tokai Coffee
    2340,Shopping,2026-06-17,Amazon

`description` is optional and may be blank. `date` accepts a few common
formats (see DATE_FORMATS below); anything else is reported as a row error
rather than failing the whole upload.
"""
import csv
import io
from datetime import datetime, date as date_type

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.schemas.expense import ExpenseCreate
from app.schemas.csv_upload import CSVRowError, CSVUploadResult
from app.services import expense_service

REQUIRED_COLUMNS = {"amount", "category", "date"}
OPTIONAL_COLUMNS = {"description"}

DATE_FORMATS = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y")


class CSVFormatError(ValueError):
    """Raised when the file isn't usable at all (e.g. missing required columns)."""


def _parse_date(raw: str) -> date_type:
    raw = raw.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    raise ValueError(
        f"could not parse date '{raw}' — expected one of: "
        "YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY"
    )


def _parse_amount(raw: str) -> float:
    raw = raw.strip().replace(",", "").replace("₹", "").replace("$", "")
    if not raw:
        raise ValueError("amount is required")
    return float(raw)


def parse_and_import_csv(db: Session, file_bytes: bytes) -> CSVUploadResult:
    try:
        text = file_bytes.decode("utf-8-sig")  # handles Excel's UTF-8 BOM gracefully
    except UnicodeDecodeError as exc:
        raise CSVFormatError(f"file is not valid UTF-8 text: {exc}") from exc

    reader = csv.DictReader(io.StringIO(text))

    if reader.fieldnames is None:
        raise CSVFormatError("file appears to be empty or has no header row")

    normalized_fields = {f.strip().lower(): f for f in reader.fieldnames}
    missing = REQUIRED_COLUMNS - normalized_fields.keys()
    if missing:
        raise CSVFormatError(
            f"missing required column(s): {', '.join(sorted(missing))}. "
            f"Expected headers: amount, category, date, description (optional)."
        )

    imported = []
    errors: list[CSVRowError] = []
    total_rows = 0

    for row_number, raw_row in enumerate(reader, start=1):
        total_rows += 1

        # Re-key the row using the normalized (lowercase) column names so
        # "Amount", "AMOUNT", "amount" all work the same way.
        row = {
            key: (raw_row.get(original) or "").strip()
            for key, original in normalized_fields.items()
        }

        try:
            amount = _parse_amount(row["amount"])
            category = row["category"].strip()
            if not category:
                raise ValueError("category is required")
            parsed_date = _parse_date(row["date"])
            description = row.get("description") or None

            payload = ExpenseCreate(
                amount=amount,
                category=category,
                date=parsed_date,
                description=description,
            )
        except (ValueError, ValidationError) as exc:
            errors.append(
                CSVRowError(row_number=row_number, error=str(exc), raw_data=raw_row)
            )
            continue

        try:
            expense = expense_service.create_expense(db, payload)
            imported.append(expense)
        except Exception as exc:  # database-level failure on an otherwise valid row
            db.rollback()
            errors.append(
                CSVRowError(
                    row_number=row_number,
                    error=f"database error while saving row: {exc}",
                    raw_data=raw_row,
                )
            )

    return CSVUploadResult(
        total_rows=total_rows,
        imported_count=len(imported),
        failed_count=len(errors),
        imported_expenses=imported,
        errors=errors,
    )
