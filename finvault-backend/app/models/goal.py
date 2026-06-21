"""
Goal table.

The spec asks for id, target_amount, and target_date. Two small additions
have been made beyond that minimum, called out here explicitly:

  - `name`: the frontend Goals page already displays a goal name
    (e.g. "Emergency Fund"). Without it, a goal is just an anonymous number.
  - `current_amount`: tracks progress toward the goal. Defaults to 0 so it's
    safe to ignore until a later phase wires up contributions.

No goal CRUD routes are built in this phase per your instructions — this
model just establishes the table so the column shape is settled before the
frontend integration in a later phase.
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
