"""
Schemas for the Recommendation resource. No routes use these yet — the
AI agent that generates recommendations is built in a later phase.
"""
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class RecommendationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    dismissed = "dismissed"


class RecommendationBase(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    status: RecommendationStatus = RecommendationStatus.pending


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationOut(RecommendationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
