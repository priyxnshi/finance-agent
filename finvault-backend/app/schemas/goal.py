"""
Schemas for the Goal resource.

No routes use these yet in Phase 2 — they're provided so the table and its
contract are fully defined ahead of the Goals API being built in a later
phase, and so ExpenseOut-style consistency is established across resources.
"""
from datetime import date as date_type, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class GoalBase(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    target_amount: float = Field(..., gt=0)
    target_date: date_type
    current_amount: float = Field(default=0.0, ge=0)


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    target_amount: Optional[float] = Field(default=None, gt=0)
    target_date: Optional[date_type] = None
    current_amount: Optional[float] = Field(default=None, ge=0)


class GoalOut(GoalBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
