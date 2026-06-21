"""
Schemas for the UserBehavior resource. No routes use these yet — this
becomes the event log the AI agent's memory layer reads from in a later
phase.
"""
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class UserBehaviorBase(BaseModel):
    action: str = Field(..., min_length=1, max_length=120)


class UserBehaviorCreate(UserBehaviorBase):
    pass


class UserBehaviorOut(UserBehaviorBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
