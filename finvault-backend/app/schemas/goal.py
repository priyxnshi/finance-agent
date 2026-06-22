"""
Schemas for the Goal resource.

GoalOut mirrors the raw DB row. GoalProgress is everything the Goal Planner
UI needs that *isn't* a stored column — it's computed fresh on every request
by app/services/goal_service.py and merged with GoalOut to make GoalDetail,
which is what every goal route actually returns.
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


class GoalProgress(BaseModel):
    progress_percent: float  # 0-100, capped at 100 even if current > target
    gap_amount: float  # target_amount - current_amount, floored at 0
    days_remaining: int  # negative if target_date has passed
    required_monthly_savings: float  # gap spread evenly across remaining months, to hit target_date
    estimated_completion_date: Optional[date_type]  # None if pace can't be estimated yet
    pace_status: str  # "ahead" | "on_track" | "behind" | "insufficient_data" | "completed"


class GoalDetail(GoalOut, GoalProgress):
    """What every /goal route actually returns: stored fields + computed progress."""

    pass

