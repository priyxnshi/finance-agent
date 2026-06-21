"""
Response shapes for the /analytics/* endpoints.
"""
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
