"""
Goal Planner routes.

    POST   /goal        create a new savings goal
    GET    /goals        list all goals, each with computed progress
    GET    /goal/{id}    fetch a single goal, with computed progress
    PUT    /goal/{id}    update a goal (e.g. add a contribution to current_amount)
    DELETE /goal/{id}    delete a goal

Every response includes both the stored fields (target_amount, target_date,
current_amount, ...) and computed progress fields (progress_percent,
gap_amount, required_monthly_savings, estimated_completion_date,
pace_status) — see app/services/goal_service.py for how those are derived.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.goal import GoalCreate, GoalDetail, GoalUpdate
from app.services import goal_service

router = APIRouter(tags=["Goals"])


def _to_detail(goal) -> GoalDetail:
    progress = goal_service.compute_goal_progress(goal)
    return GoalDetail(
        id=goal.id,
        name=goal.name,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        current_amount=goal.current_amount,
        created_at=goal.created_at,
        **progress.model_dump(),
    )


@router.post("/goal", response_model=GoalDetail, status_code=status.HTTP_201_CREATED)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db)):
    """Create a new savings goal."""
    goal = goal_service.create_goal(db, payload)
    return _to_detail(goal)


@router.get("/goals", response_model=list[GoalDetail])
def list_goals(db: Session = Depends(get_db)):
    """List every goal, soonest target_date first, each with computed progress."""
    goals = goal_service.list_goals(db)
    return [_to_detail(g) for g in goals]


@router.get("/goal/{goal_id}", response_model=GoalDetail)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = goal_service.get_goal(db, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail=f"Goal with id {goal_id} not found")
    return _to_detail(goal)


@router.put("/goal/{goal_id}", response_model=GoalDetail)
def update_goal(goal_id: int, payload: GoalUpdate, db: Session = Depends(get_db)):
    """
    Update a goal. To log a contribution from the frontend, send the new
    total: {"current_amount": <old current_amount + contribution>}.
    """
    goal = goal_service.update_goal(db, goal_id, payload)
    if goal is None:
        raise HTTPException(status_code=404, detail=f"Goal with id {goal_id} not found")
    return _to_detail(goal)


@router.delete("/goal/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    deleted = goal_service.delete_goal(db, goal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Goal with id {goal_id} not found")
    return None
