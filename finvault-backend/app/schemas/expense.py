"""
Pydantic schemas for the Expense resource.

Naming convention used throughout this project:
  - `*Create` — shape required to create a new record (POST body)
  - `*Update` — shape for partial updates (PUT/PATCH body), all fields optional
  - `*Out`    — shape returned to the client (includes server-generated fields)
"""
from datetime import date as date_type, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator

ALLOWED_CATEGORIES_HINT = (
    "Any non-empty string is accepted (e.g. 'Food & Dining', 'Housing', "
    "'Transport'). Category values aren't restricted to a fixed enum so the "
    "ML categorizer in a later phase can introduce new categories freely."
)


class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount, must be greater than 0")
    category: str = Field(..., min_length=1, max_length=64)
    date: date_type
    description: Optional[str] = Field(default=None, max_length=255)

    @field_validator("category")
    @classmethod
    def strip_category(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("category cannot be blank")
        return v

    @field_validator("description")
    @classmethod
    def strip_description(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v or None


class ExpenseCreate(ExpenseBase):
    """Body for POST /expense"""

    pass


class ExpenseUpdate(BaseModel):
    """Body for PUT /expense/{id}. All fields optional — only what's provided is changed."""

    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = Field(default=None, min_length=1, max_length=64)
    date: Optional[date_type] = None
    description: Optional[str] = Field(default=None, max_length=255)

    @field_validator("category")
    @classmethod
    def strip_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("category cannot be blank")
        return v


class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
