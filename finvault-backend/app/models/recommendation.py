"""
Recommendation table.

Holds AI-agent-generated suggestions (e.g. "You're overspending on
Subscriptions"). The agent itself is built in a later phase — this table
just reserves the storage shape so recommendations can be persisted and
marked as read/dismissed/accepted once it exists.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(500), nullable=False)
    # Plain string rather than a DB-level enum: SQLite enforces enums weakly
    # anyway, and Pydantic validates allowed values on the way in (see
    # app/schemas/recommendation.py) — see RecommendationStatus for the
    # canonical set of values.
    status = Column(String(20), nullable=False, default="pending", index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Recommendation id={self.id} status={self.status!r}>"
