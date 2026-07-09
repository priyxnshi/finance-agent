"""
Goal service layer.

Two responsibilities:
  1. Plain CRUD against the goals table (mirrors expense_service.py).
  2. compute_goal_progress() — turns the four stored columns into the
     numbers the Goal Planner UI actually needs: progress %, gap, required
     monthly savings, and an estimated completion date.

No ML here — estimated_completion_date is a deterministic projection from
the goal's own contribution-to-date, not a model. See the docstring on
compute_goal_progress() for the exact formula.
"""
from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalProgress

AVG_DAYS_PER_MONTH = 30.44


# --- CRUD --------------------------------------------------------------


def create_goal(db: Session, payload: GoalCreate) -> Goal:
    goal = Goal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    try:
        from app.services.telegram_service import send_telegram_notification
        msg = (
            f"🎯 <b>New Savings Goal Set</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━━\n"
            f"<b>Name:</b> {goal.name}\n"
            f"<b>Target:</b> ₹{goal.target_amount:,.2f}\n"
            f"<b>Target Date:</b> {goal.target_date}"
        )
        send_telegram_notification(msg)
    except Exception:
        pass
        
    return goal


def get_goal(db: Session, goal_id: int) -> Optional[Goal]:
    return db.get(Goal, goal_id)


def list_goals(db: Session) -> list[Goal]:
    query = select(Goal).order_by(Goal.target_date.asc())
    return list(db.scalars(query))


def update_goal(db: Session, goal_id: int, payload: GoalUpdate) -> Optional[Goal]:
    goal = get_goal(db, goal_id)
    if goal is None:
        return None

    old_amount = goal.current_amount or 0.0

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    new_amount = goal.current_amount or 0.0
    if old_amount != new_amount:
        try:
            from app.services.telegram_service import send_telegram_notification
            progress = compute_goal_progress(goal)
            status_msg = "🎉 <b>Goal Achieved!</b>\n" if progress.progress_percent >= 100.0 else "🎯 <b>Goal Progress Update</b>\n"
            msg = (
                f"{status_msg}"
                f"━━━━━━━━━━━━━━━━━━━━━\n"
                f"<b>Goal:</b> {goal.name}\n"
                f"<b>Contribution:</b> +₹{new_amount - old_amount:,.2f}\n"
                f"<b>Current Balance:</b> ₹{new_amount:,.2f} of ₹{goal.target_amount:,.2f} ({progress.progress_percent}%)\n"
                f"<b>Pace Status:</b> {progress.pace_status.upper()}"
            )
            send_telegram_notification(msg)
        except Exception:
            pass

    return goal


def delete_goal(db: Session, goal_id: int) -> bool:
    goal = get_goal(db, goal_id)
    if goal is None:
        return False
    db.delete(goal)
    db.commit()
    return True


# --- Progress calculation ------------------------------------------------


def compute_goal_progress(goal: Goal, today: Optional[date] = None) -> GoalProgress:
    """
    Computes everything the Goal Planner UI shows beyond the raw stored
    fields, using only data the goal itself already has:

      - progress_percent: current_amount / target_amount, capped at 100.
      - gap_amount: how much more is needed, floored at 0.
      - days_remaining: days until target_date (negative if it's passed).
      - required_monthly_savings: gap spread evenly over the months left,
        i.e. "what you'd need to save each month from today to hit the
        target_date exactly."
      - estimated_completion_date: projects forward using the goal's own
        pace-to-date (current_amount earned since created_at), NOT the
        required pace. This is what tells you whether you're actually
        on track: if your real pace is slower than required, the estimate
        lands after target_date.
      - pace_status: a plain-language read of the above —
          "insufficient_data" — goal is brand new (< 1 day old) or has
              zero progress yet, so a pace can't be estimated.
          "completed"  — current_amount already meets or exceeds target.
          "ahead"      — estimated completion is before target_date.
          "on_track"   — estimated completion is within ~3 days of target_date.
          "behind"     — estimated completion is after target_date.
    """
    today = today or date.today()

    target_amount = goal.target_amount
    current_amount = goal.current_amount or 0.0

    progress_percent = round(min(100.0, (current_amount / target_amount) * 100), 1) if target_amount else 0.0
    gap_amount = round(max(0.0, target_amount - current_amount), 2)
    days_remaining = (goal.target_date - today).days

    months_remaining = max(days_remaining / AVG_DAYS_PER_MONTH, 1 / AVG_DAYS_PER_MONTH)
    required_monthly_savings = round(gap_amount / months_remaining, 2) if gap_amount > 0 else 0.0

    if current_amount >= target_amount:
        return GoalProgress(
            progress_percent=100.0,
            gap_amount=0.0,
            days_remaining=days_remaining,
            required_monthly_savings=0.0,
            estimated_completion_date=None,
            pace_status="completed",
        )

    created_date = goal.created_at.date() if isinstance(goal.created_at, datetime) else goal.created_at
    days_elapsed = max((today - created_date).days, 0)

    if days_elapsed < 1 or current_amount <= 0:
        return GoalProgress(
            progress_percent=progress_percent,
            gap_amount=gap_amount,
            days_remaining=days_remaining,
            required_monthly_savings=required_monthly_savings,
            estimated_completion_date=None,
            pace_status="insufficient_data",
        )

    pace_per_day = current_amount / days_elapsed
    if pace_per_day <= 0:
        return GoalProgress(
            progress_percent=progress_percent,
            gap_amount=gap_amount,
            days_remaining=days_remaining,
            required_monthly_savings=required_monthly_savings,
            estimated_completion_date=None,
            pace_status="insufficient_data",
        )

    days_to_finish = gap_amount / pace_per_day
    estimated_completion_date = today + timedelta(days=round(days_to_finish))

    if estimated_completion_date < goal.target_date:
        pace_status = "ahead"
    elif (estimated_completion_date - goal.target_date).days <= 3:
        pace_status = "on_track"
    else:
        pace_status = "behind"

    return GoalProgress(
        progress_percent=progress_percent,
        gap_amount=gap_amount,
        days_remaining=days_remaining,
        required_monthly_savings=required_monthly_savings,
        estimated_completion_date=estimated_completion_date,
        pace_status=pace_status,
    )
