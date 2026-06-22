"""
Analytics routes.

    GET /analytics/summary      total/monthly/weekly spending, top category
    GET /analytics/trends       monthly trend + month-over-month growth %
    GET /analytics/categories   full category breakdown with percentages

All calculation logic lives in app/services/analytics_service.py — these
routes just call it and return the result.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import (
    CategoriesResponse,
    SummaryResponse,
    TrendsResponse,
    HeatmapResponse,
    HealthScoreResponse,
    MonthlySummaryResponse,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    """Total, monthly, and weekly spending plus the top spending category."""
    return analytics_service.build_summary(db)


@router.get("/trends", response_model=TrendsResponse)
def get_trends(
    months: int = Query(6, ge=1, le=24, description="How many months back to include"),
    db: Session = Depends(get_db),
):
    """Monthly spending totals over time, plus month-over-month growth %."""
    return analytics_service.build_trends(db, months=months)


@router.get("/categories", response_model=CategoriesResponse)
def get_categories(db: Session = Depends(get_db)):
    """Spending broken down by category, sorted highest to lowest."""
    return analytics_service.build_categories(db)


@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    days: int = Query(365, ge=7, le=730, description="How many days back to include"),
    db: Session = Depends(get_db),
):
    """Daily spending totals for the GitHub-style spending heatmap."""
    return analytics_service.build_heatmap(db, days=days)


@router.get("/health-score", response_model=HealthScoreResponse)
def get_health_score(db: Session = Depends(get_db)):
    """
    Composite 0-100 budget health score from four weighted factors (spending
    trend, consistency, category diversification, goal progress). A fixed
    heuristic, not a trained model — see analytics_service.build_health_score
    for the exact formula.
    """
    return analytics_service.build_health_score(db)


@router.get("/monthly-summary", response_model=MonthlySummaryResponse)
def get_monthly_summary(db: Session = Depends(get_db)):
    """Current-month spending summary: total, pace, top category, MoM change."""
    return analytics_service.build_monthly_summary(db)
