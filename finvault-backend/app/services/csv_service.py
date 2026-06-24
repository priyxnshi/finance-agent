"""
CSV import service.

Expected CSV format — header row required, columns matched case-insensitively
and in any order:

    amount,category,date,description
    480,Food & Dining,2026-06-19,Blue Tokai Coffee
    2340,,2026-06-17,Amazon           ← blank category: ML auto-fills it
    8900,Travel,2026-06-16,           ← blank description: category used as-is

`category` is now optional. When blank (or the column is omitted entirely),
the ML categorizer predicts it from `description`. If the categorizer model
hasn't been trained yet, the row still imports with category "Uncategorized"
instead of failing — so bulk imports never block on a missing model.

`description` is optional and may be blank. `date` accepts a few common
formats (see DATE_FORMATS below).
"""
import csv
import io
from datetime import datetime, date as date_type

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.schemas.expense import ExpenseCreate
from app.schemas.csv_upload import CSVRowError, CSVUploadResult
from app.services import expense_service

# category is no longer required — ML fills it when blank
REQUIRED_COLUMNS = {"amount", "date"}
OPTIONAL_COLUMNS = {"category", "description"}

DATE_FORMATS = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y")

FALLBACK_CATEGORY = "Uncategorized"


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


def _predict_category(description: str) -> tuple[str, bool]:
    """
    Try to predict a category using the ML categorizer.
    Returns (category, was_predicted).
    Falls back to FALLBACK_CATEGORY gracefully if the model isn't trained.
    """
    if not description or not description.strip():
        return FALLBACK_CATEGORY, False
    try:
        from app.ml.categorizer import predict
        result = predict(description.strip())
        return result["predicted_category"], True
    except Exception:
        # Model not trained, import error, or any other issue — never block the upload
        return FALLBACK_CATEGORY, False


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
            f"Expected headers: amount, date, description (optional), category (optional — ML fills when blank)."
        )

    imported = []
    errors: list[CSVRowError] = []
    total_rows = 0
    auto_categorized = 0

    for row_number, raw_row in enumerate(reader, start=1):
        total_rows += 1

        row = {
            key: (raw_row.get(original) or "").strip()
            for key, original in normalized_fields.items()
        }

        try:
            amount = _parse_amount(row["amount"])
            parsed_date = _parse_date(row["date"])
            description = row.get("description") or None

            # --- Category resolution: CSV value → ML prediction → fallback ---
            raw_category = row.get("category", "").strip()
            if raw_category:
                category = raw_category
                predicted = False
            else:
                # Blank or missing category column — ask the ML model
                category, predicted = _predict_category(description or "")
                if predicted:
                    auto_categorized += 1

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
        except Exception as exc:
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
        auto_categorized=auto_categorized,
    )

