"""
Goal table.

The spec asks for id, target_amount, and target_date. Two small additions
have been made beyond that minimum, called out here explicitly:

  - `name`: the frontend Goals page displays a goal name (e.g. "Emergency Fund").
  - `current_amount`: tracks progress toward the goal, updated via PUT /goal/{id}.

`created_at` doubles as the goal's start date for pace calculations in
app/services/goal_service.py (Phase 3) — see compute_goal_progress().
"""
from sqlalchemy import Column, Integer, Float, String, Date, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=True)
    target_amount = Column(Float, nullable=False)
    target_date = Column(Date, nullable=False)
    current_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Goal id={self.id} name={self.name!r} target_amount={self.target_amount}>"
