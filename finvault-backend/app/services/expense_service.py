"""
Expense service layer.

Routes should stay thin (parse request, call a service, shape the response).
All actual querying/mutation logic lives here so it's reusable — e.g. the
CSV upload service calls `create_expense` for each row instead of duplicating
insert logic.
"""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(db: Session, payload: ExpenseCreate) -> Expense:
    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_expense(db: Session, expense_id: int) -> Optional[Expense]:
    return db.get(Expense, expense_id)


def list_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date=None,
    end_date=None,
) -> list[Expense]:
    """
    Returns expenses ordered most-recent-first, with optional filtering.
    `skip`/`limit` provide pagination so the endpoint stays usable as the
    table grows past a few thousand rows.
    """
    query = select(Expense)

    if category:
        query = query.where(Expense.category == category)
    if start_date:
        query = query.where(Expense.date >= start_date)
    if end_date:
        query = query.where(Expense.date <= end_date)

    query = query.order_by(Expense.date.desc(), Expense.id.desc()).offset(skip).limit(limit)
    return list(db.scalars(query))


def count_expenses(
    db: Session,
    category: Optional[str] = None,
    start_date=None,
    end_date=None,
) -> int:
    query = select(Expense)
    if category:
        query = query.where(Expense.category == category)
    if start_date:
        query = query.where(Expense.date >= start_date)
    if end_date:
        query = query.where(Expense.date <= end_date)
    return len(list(db.scalars(query)))


def update_expense(db: Session, expense_id: int, payload: ExpenseUpdate) -> Optional[Expense]:
    expense = get_expense(db, expense_id)
    if expense is None:
        return None

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense_id: int) -> bool:
    expense = get_expense(db, expense_id)
    if expense is None:
        return False
    db.delete(expense)
    db.commit()
    return True
