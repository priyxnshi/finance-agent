"""
Expense table.

Represents a single transaction — either manually entered through the
/expense endpoints or imported via /upload-csv.
"""
from sqlalchemy import Column, Integer, Float, String, Date, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(64), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    # Audit timestamp — not part of the spec but standard practice for any
    # production table, and cheap to have for debugging/ordering later.
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Expense id={self.id} amount={self.amount} category={self.category!r} date={self.date}>"
