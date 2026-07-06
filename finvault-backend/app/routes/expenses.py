"""
Expense CRUD routes.

    POST   /expense        create a new expense
    GET    /expenses        list expenses (paginated, optionally filtered)
    PUT    /expense/{id}    update an existing expense
    DELETE /expense/{id}    delete an expense

Routes stay thin: validate via the Pydantic schema (handled automatically by
FastAPI), delegate to the service layer, and shape the HTTP response.
"""
from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseUpdate
from app.services import expense_service

router = APIRouter(tags=["Expenses"])


class ParseRequest(BaseModel):
    text: str


@router.post("/expense/parse")
def parse_expense(payload: ParseRequest):
    """Parse a natural language text description into expense details."""
    from app.services.nlp_parser import parse_expense_text
    return parse_expense_text(payload.text)


@router.post("/expense", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a single expense record."""
    return expense_service.create_expense(db, payload)


@router.get("/expenses", response_model=list[ExpenseOut])
def list_expenses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    category: Optional[str] = Query(None, description="Filter by exact category match"),
    start_date: Optional[date_type] = Query(None, description="Only include expenses on/after this date"),
    end_date: Optional[date_type] = Query(None, description="Only include expenses on/before this date"),
    db: Session = Depends(get_db),
):
    """
    List expenses, most recent first. Supports pagination and optional
    filtering by category and/or date range.
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    return expense_service.list_expenses(
        db, skip=skip, limit=limit, category=category, start_date=start_date, end_date=end_date
    )


@router.put("/expense/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    """Update an existing expense. Only fields included in the body are changed."""
    expense = expense_service.update_expense(db, expense_id, payload)
    if expense is None:
        raise HTTPException(status_code=404, detail=f"Expense with id {expense_id} not found")
    return expense


@router.delete("/expense/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense. Returns 204 with no body on success."""
    deleted = expense_service.delete_expense(db, expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Expense with id {expense_id} not found")
    return None
