import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import AgentMemory, AgentStateCache

class FinVaultAIAgent:
    def __init__(self, db_session: Session):
        self.db = db_session

    # === STEP 1 & 2: OBSERVE & ANALYZE ===
    def analyze_financial_health(self, monthly_spend: float, monthly_income: float, goal_probability: float, anomalies_count: int) -> dict:
        """
        Calculates a highly comprehensive Financial Health Score (0-100)
        """
        # 1. Spending Ratio Component (Ideal burn rate is under 70% of income)
        burn_rate = (monthly_spend / monthly_income) if monthly_income > 0 else 1.0
        spending_score = max(0, min(100, int((1.0 - burn_rate) * 100 + 30)))
        
        # 2. Goal Progress Component
        goal_score = int(goal_probability * 100)
        
        # 3. Security/Stability Component
        security_score = max(0, 100 - (anomalies_count * 25))

        # Weighted composition: 40% Burning habits, 40% Savings path, 20% Baseline security
        final_score = int((spending_score * 0.4) + (goal_score * 0.4) + (security_score * 0.2))
        final_score = max(5, min(100, final_score))

        return {
            "health_score": final_score,
            "breakdown": {
                "spending_efficiency": spending_score,
                "savings_velocity": goal_score,
                "stability_index": security_score
            }
        }

    # === STEP 3 & 4: DECIDE & ACT (ADAPTIVE SUGGESTIONS) ===
    def compute_agent_actions(self, category_breakdown: dict, current_health: dict) -> list:
        """
        Evaluates memory trends to alter agent decision strategies dynamically.
        """
        recommendations = []
        
        # Evaluate user resistance trends over the last 14 days
        for category, totals in category_breakdown.items():
            if totals.get("amount", 0) > totals.get("budget", 99999):
                
                # Check history logs for ignored notifications
                ignored_count = self.db.query(AgentMemory).filter(
                    AgentMemory.category == category,
                    AgentMemory.action_taken.in_(["IGNORED", "DISMISSED"]),
                    AgentMemory.timestamp >= datetime.utcnow() - timedelta(days=14)
                ).count()

                # Adaptive Strategy Resolution Engine
                if ignored_count >= 3:
                    # User is highly resistant to aggressive pruning options. Change strategy.
                    strategy = "supportive"
                    title = f"Optimize Liquidity for {category}"
                    body = f"Pruning {category} hasn't worked. Let's leave this budget intact and auto-transfer ₹50 to savings on payday to offset it."
                else:
                    strategy = "aggressive"
                    title = f"Reduce {category} Expenses"
                    body = f"Your spending in {category} is over budget by ₹{round(totals['amount'] - totals['budget'], 2)}. Recommend reduction."

                recommendations.append({
                    "id": f"rec_{category}_{int(datetime.utcnow().timestamp())}",
                    "category": category,
                    "strategy_type": strategy,
                    "title": title,
                    "body": body,
                    "severity": "warning" if strategy == "aggressive" else "info"
                })

        # Add global foundational alerts based on health indices
        if current_health["health_score"] < 50:
            recommendations.append({
                "id": f"rec_health_{int(datetime.utcnow().timestamp())}",
                "category": "Global",
                "strategy_type": "intervention",
                "title": "Critical Budget Intercept Triggered",
                "body": "Aggregate cash flows are tracking at dangerous velocity bands. Freeze discretionary spending.",
                "severity": "critical"
            })

        return recommendations

    # === STEP 5: LEARN (MUTATE INTERNAL AGENT STATE) ===
    def log_user_action(self, recommendation_id: str, category: str, strategy: str, action: str):
        """Updates internal telemetry tracking cache to adapt algorithms over time."""
        memory_entry = AgentMemory(
            recommendation_id=recommendation_id,
            category=category,
            strategy_type=strategy,
            action_taken=action
        )
        self.db.add(memory_entry)
        self.db.commit()