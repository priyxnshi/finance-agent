"""
CSV import route.

    POST /upload-csv    multipart/form-data file upload, field name "file"
"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.csv_upload import CSVUploadResult
from app.services.csv_service import CSVFormatError, parse_and_import_csv

router = APIRouter(tags=["CSV Upload"])

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB — generous for a personal expense CSV


@router.post("/upload-csv", response_model=CSVUploadResult)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a CSV of transactions to import as expenses.

    Expected columns (case-insensitive, any order): amount, category, date,
    description (optional). Rows that fail validation are skipped and
    reported individually in the response rather than failing the whole
    upload — see `errors` in the response body.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large — max size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB",
        )

    try:
        result = parse_and_import_csv(db, contents)
    except CSVFormatError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result
