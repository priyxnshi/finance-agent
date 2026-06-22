from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class AgentMemory(Base):
    __tablename__ = "agent_memory"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    recommendation_id = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False) # e.g., "Food", "Shopping"
    strategy_type = Column(String, nullable=False) # "aggressive" or "supportive"
    action_taken = Column(String, nullable=False) # "PENDING", "ACCEPTED", "IGNORED", "DISMISSED"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentStateCache(Base):
    __tablename__ = "agent_state_cache"

    id = Column(Integer, primary_key=True, index=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    health_score = Column(Integer, default=100)
    metrics_breakdown = Column(JSON, nullable=False) # Stores individual vector weights