import os
import json
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict

from app.database import get_db
from app.services.agent_service import FinVaultAIAgent
from app.config import settings
from app.services.telegram_service import send_telegram_notification

router = APIRouter(prefix="/api/agent", tags=["AI Agent Engine"])
federated_router = APIRouter(prefix="/api/federated", tags=["Federated Learning"])
telegram_router = APIRouter(prefix="/api/telegram", tags=["Telegram Integration"])

STATE_FILE = os.path.join(os.path.dirname(__file__), "../federated/fl_state.json")

class TelegramSettingsRequest(BaseModel):
    telegram_bot_token: str
    telegram_chat_id: str

def save_settings_to_env(bot_token: str, chat_id: str):
    env_path = os.path.join(os.path.dirname(__file__), "../../.env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
            
    has_token = False
    has_chat = False
    new_lines = []
    for line in lines:
        if line.strip().startswith("TELEGRAM_BOT_TOKEN="):
            new_lines.append(f"TELEGRAM_BOT_TOKEN={bot_token}\n")
            has_token = True
        elif line.strip().startswith("TELEGRAM_CHAT_ID="):
            new_lines.append(f"TELEGRAM_CHAT_ID={chat_id}\n")
            has_chat = True
        else:
            new_lines.append(line)
            
    if not has_token:
        new_lines.append(f"TELEGRAM_BOT_TOKEN={bot_token}\n")
    if not has_chat:
        new_lines.append(f"TELEGRAM_CHAT_ID={chat_id}\n")
        
    with open(env_path, "w") as f:
        f.writelines(new_lines)

@telegram_router.get("/settings")
async def get_telegram_settings():
    return {
        "telegram_bot_token": settings.telegram_bot_token,
        "telegram_chat_id": settings.telegram_chat_id
    }

@telegram_router.post("/settings")
async def update_telegram_settings(payload: TelegramSettingsRequest):
    settings.telegram_bot_token = payload.telegram_bot_token
    settings.telegram_chat_id = payload.telegram_chat_id
    try:
        save_settings_to_env(payload.telegram_bot_token, payload.telegram_chat_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to persist settings: {e}")
    return {"status": "success", "message": "Telegram settings updated and saved."}

@telegram_router.post("/test")
async def test_telegram_message():
    success = send_telegram_notification(
        "⚡ <b>FinVault Test Notification</b>\n\n"
        "Your Telegram bot configuration is working correctly! You are now set up to log expenses directly via chat."
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to send Telegram message. Please check your token and chat ID.")
    return {"status": "success", "message": "Test message sent to Telegram."}


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

@router.get("/recommendations")
async def get_agent_recommendations(db: Session = Depends(get_db)):
    from app.services.analytics_service import build_summary, build_categories
    from app.services.goal_service import list_goals, compute_goal_progress
    
    summary = build_summary(db)
    categories = build_categories(db)
    
    anomalies_count = 0
    try:
        from app.ml.anomaly_detector import detect_from_db
        anomalies = detect_from_db(db)
        anomalies_count = len([a for a in anomalies if a.get("anomaly")])
    except Exception:
        pass
        
    goals = list_goals(db)
    goal_prob = 1.0
    if goals:
        probs = []
        for g in goals:
            prog = compute_goal_progress(g)
            probs.append(prog.progress_percent / 100.0)
        goal_prob = sum(probs) / len(probs)
        
    DEFAULT_BUDGETS = {
        "Food": 4000.0,
        "Travel": 2500.0,
        "Bills": 8000.0,
        "Shopping": 5000.0,
        "Entertainment": 3000.0,
        "Other": 1500.0
    }
    
    breakdown = {}
    for cat in categories.breakdown:
        breakdown[cat.category] = {
            "amount": cat.amount,
            "budget": DEFAULT_BUDGETS.get(cat.category, 99999.0)
        }
        
    agent = FinVaultAIAgent(db)
    health = agent.analyze_financial_health(
        summary.monthly_spending, 50000.0,
        goal_prob, anomalies_count
    )
    
    actions = agent.compute_agent_actions(breakdown, health)
    return {
        "recommendations": actions
    }

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

@federated_router.post("/simulate-round")
async def simulate_federated_round():
    """Simulates a federated learning round for presentation purposes, updating the fl_state.json file."""
    if not os.path.exists(STATE_FILE):
        state = {
            "status": "Active Aggregator Running",
            "current_round": 0,
            "connected_clients": 3,
            "global_accuracy": 0.0,
            "aggregation_strategy": "FedAvg",
            "privacy_status": "Strict (Zero Data Leakage)",
            "history": []
        }
    else:
        try:
            with open(STATE_FILE, "r") as f:
                state = json.load(f)
        except Exception:
            state = {
                "status": "Active Aggregator Running",
                "current_round": 0,
                "connected_clients": 3,
                "global_accuracy": 0.0,
                "aggregation_strategy": "FedAvg",
                "privacy_status": "Strict (Zero Data Leakage)",
                "history": []
            }

    state["current_round"] += 1
    state["connected_clients"] = 3
    state["status"] = "Active Aggregator Running"

    new_accuracy = min(0.45 + (state["current_round"] * 0.08), 0.89)
    state["global_accuracy"] = round(new_accuracy, 3)

    state["history"].append({
        "round": state["current_round"],
        "accuracy": round(new_accuracy, 3),
        "loss": round(max(0.6 - (state["current_round"] * 0.07), 0.12), 3),
        "timestamp": time.time()
    })

    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

    return state