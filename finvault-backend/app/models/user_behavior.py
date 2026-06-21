"""
User behavior table.

A lightweight event log (e.g. "viewed_dashboard", "exported_csv",
"created_goal"). This becomes input for the AI agent's memory layer in a
later phase. No routes are built against it yet in Phase 2 — it's here so
the schema exists and other parts of the backend (or a future middleware)
can start writing to it.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class UserBehavior(Base):
    __tablename__ = "user_behavior"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(120), nullable=False, index=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<UserBehavior id={self.id} action={self.action!r} timestamp={self.timestamp}>"
