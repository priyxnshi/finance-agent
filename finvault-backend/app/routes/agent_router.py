import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict

from app.database import get_db
from app.services.agent_service import FinVaultAIAgent

router = APIRouter(prefix="/api/agent", tags=["AI Agent Engine"])
federated_router = APIRouter(prefix="/api/federated", tags=["Federated Learning"])

STATE_FILE = os.path.join(os.path.dirname(__file__), "../federated/fl_state.json")

class AgentExecutionRequest(BaseModel):
    monthly_spend: float
    monthly_income: float
    goal_probability: float
    anomalies_count: int
    category_breakdown: Dict[str, Dict[str, float]] # e.g., {"Food": {"amount": 620, "budget": 400}}

class UserFeedbackRequest(BaseModel):
    recommendation_id: str
    category: str
    strategy_type: str
    action_taken: str # ACCEPTED, IGNORED, DISMISSED

@router.post("/process-loop")
async def execute_agent_loop(payload: AgentExecutionRequest, db: Session = Depends(get_db)):
    agent = FinVaultAIAgent(db)
    
    # 1. Evaluate current structural fitness
    health = agent.analyze_financial_health(
        payload.monthly_spend, payload.monthly_income, 
        payload.goal_probability, payload.anomalies_count
    )
    
    # 2. Derive dynamic strategy decisions
    actions = agent.compute_agent_actions(payload.category_breakdown, health)
    
    return {
        "agent_score_metrics": health,
        "active_recommendations": actions
    }

@router.post("/feedback")
async def record_user_feedback(payload: UserFeedbackRequest, db: Session = Depends(get_db)):
    if payload.action_taken not in ["ACCEPTED", "IGNORED", "DISMISSED"]:
        raise HTTPException(status_code=400, detail="Invalid action value descriptor.")
    
    agent = FinVaultAIAgent(db)
    agent.log_user_action(
        payload.recommendation_id, payload.category, 
        payload.strategy_type, payload.action_taken
    )
    return {"status": "Telemetry processed. Local adaptation matrix calibrated."}

@federated_router.get("/status")
async def get_federated_metrics():
    """Reads state summaries produced by the underlying Flower orchestration process."""
    if not os.path.exists(STATE_FILE):
        return {
            "status": "Server Awaiting Initialization Trigger",
            "current_round": 0,
            "connected_clients": 0,
            "global_accuracy": 0.0,
            "aggregation_strategy": "FedAvg",
            "privacy_status": "Secure (On-Device Local Context Only)",
            "history": []
        }
    with open(STATE_FILE, "r") as f:
        return json.load(f)