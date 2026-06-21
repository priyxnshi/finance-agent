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
from app.schemas.analytics import CategoriesResponse, SummaryResponse, TrendsResponse
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
