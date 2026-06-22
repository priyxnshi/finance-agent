"""
Response shapes for the /analytics/* endpoints.
"""
from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category: str
    total: float
    transaction_count: int
    percentage: float  # share of total spending, 0-100


class SummaryResponse(BaseModel):
    total_spending: float
    monthly_spending: float
    weekly_spending: float
    top_category: Optional[str]
    top_category_amount: float
    transaction_count: int


class MonthlyTrendPoint(BaseModel):
    month: str  # "2026-06"
    total: float


class TrendsResponse(BaseModel):
    monthly_trend: list[MonthlyTrendPoint]
    spending_growth_percent: Optional[float]  # current month vs previous month
    current_month_total: float
    previous_month_total: float


class CategoriesResponse(BaseModel):
    categories: list[CategoryBreakdownItem]
    total_spending: float


# --- Phase 3 additions ---------------------------------------------------


class HeatmapDay(BaseModel):
    date: date_type
    total: float
    transaction_count: int


class HeatmapResponse(BaseModel):
    days: list[HeatmapDay]
    max_daily_total: float  # convenience for the frontend's intensity bucketing


class HealthScoreFactor(BaseModel):
    name: str
    score: float  # 0-100, this factor's own contribution before weighting
    weight: float  # 0-1, share of the overall score this factor accounts for
    description: str


class HealthScoreResponse(BaseModel):
    score: int  # 0-100 overall
    label: str  # "Excellent" | "Good" | "Fair" | "Needs Attention"
    factors: list[HealthScoreFactor]


class MonthlySummaryResponse(BaseModel):
    month: str  # "2026-06"
    total_spent: float
    transaction_count: int
    average_daily_spend: float
    top_category: Optional[str]
    top_category_amount: float
    change_vs_previous_month_percent: Optional[float]
