"""
Analytics service.

All spending calculations (totals, trends, category breakdowns) live here,
separate from the route layer. Routes call these functions and return their
result directly — no calculation logic in app/routes/analytics.py.

Scale note: month-by-month totals are computed with one query per month
rather than a single GROUP BY extract(...) query. For a personal-finance-app
amount of data (thousands, not millions, of rows) this is simple, portable
across SQLite/Postgres, and easy to read — worth revisiting only if the
expenses table grows very large.
"""
import calendar
from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.analytics import (
    CategoryBreakdownItem,
    SummaryResponse,
    MonthlyTrendPoint,
    TrendsResponse,
    CategoriesResponse,
)


def _month_range(year: int, month: int) -> tuple[date, date]:
    first_day = date(year, month, 1)
    last_day = date(year, month, calendar.monthrange(year, month)[1])
    return first_day, last_day


def _sum_amount_between(db: Session, start: date, end: date) -> float:
    result = db.scalar(
        select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            Expense.date >= start, Expense.date <= end
        )
    )
    return float(result or 0.0)


def _previous_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def get_total_spending(db: Session) -> float:
    result = db.scalar(select(func.coalesce(func.sum(Expense.amount), 0.0)))
    return float(result or 0.0)


def get_transaction_count(db: Session) -> int:
    result = db.scalar(select(func.count(Expense.id)))
    return int(result or 0)


def get_monthly_spending(db: Session, today: Optional[date] = None) -> float:
    today = today or date.today()
    start, end = _month_range(today.year, today.month)
    return _sum_amount_between(db, start, end)


def get_weekly_spending(db: Session, today: Optional[date] = None) -> float:
    today = today or date.today()
    start = today - timedelta(days=today.isoweekday() - 1)  # Monday of this week
    end = start + timedelta(days=6)  # Sunday
    return _sum_amount_between(db, start, end)


def get_category_breakdown(db: Session) -> list[CategoryBreakdownItem]:
    rows = db.execute(
        select(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0.0).label("total"),
            func.count(Expense.id).label("count"),
        ).group_by(Expense.category)
    ).all()

    total_spending = sum(row.total for row in rows) or 0.0

    breakdown = [
        CategoryBreakdownItem(
            category=row.category,
            total=float(row.total),
            transaction_count=int(row.count),
            percentage=round((row.total / total_spending) * 100, 2) if total_spending else 0.0,
        )
        for row in rows
    ]
    breakdown.sort(key=lambda item: item.total, reverse=True)
    return breakdown


def get_top_category(db: Session) -> tuple[Optional[str], float]:
    breakdown = get_category_breakdown(db)
    if not breakdown:
        return None, 0.0
    top = breakdown[0]
    return top.category, top.total


def get_monthly_trend(db: Session, months: int = 6, today: Optional[date] = None) -> list[MonthlyTrendPoint]:
    """Returns spending totals for each of the last `months` months, oldest first."""
    today = today or date.today()
    points: list[MonthlyTrendPoint] = []

    year, month = today.year, today.month
    window: list[tuple[int, int]] = []
    for _ in range(months):
        window.append((year, month))
        year, month = _previous_month(year, month)
    window.reverse()

    for y, m in window:
        start, end = _month_range(y, m)
        total = _sum_amount_between(db, start, end)
        points.append(MonthlyTrendPoint(month=f"{y:04d}-{m:02d}", total=total))

    return points


def get_spending_growth_percent(db: Session, today: Optional[date] = None) -> tuple[Optional[float], float, float]:
    """
    Returns (growth_percent, current_month_total, previous_month_total).

    growth_percent is None when the previous month had zero spending (percent
    change is undefined / infinite in that case) rather than raising.
    """
    today = today or date.today()
    current_total = get_monthly_spending(db, today)

    prev_year, prev_month = _previous_month(today.year, today.month)
    prev_start, prev_end = _month_range(prev_year, prev_month)
    previous_total = _sum_amount_between(db, prev_start, prev_end)

    if previous_total == 0:
        growth = None
    else:
        growth = round(((current_total - previous_total) / previous_total) * 100, 2)

    return growth, current_total, previous_total


def build_summary(db: Session) -> SummaryResponse:
    top_category, top_category_amount = get_top_category(db)
    return SummaryResponse(
        total_spending=get_total_spending(db),
        monthly_spending=get_monthly_spending(db),
        weekly_spending=get_weekly_spending(db),
        top_category=top_category,
        top_category_amount=top_category_amount,
        transaction_count=get_transaction_count(db),
    )


def build_trends(db: Session, months: int = 6) -> TrendsResponse:
    growth, current_total, previous_total = get_spending_growth_percent(db)
    return TrendsResponse(
        monthly_trend=get_monthly_trend(db, months=months),
        spending_growth_percent=growth,
        current_month_total=current_total,
        previous_month_total=previous_total,
    )


def build_categories(db: Session) -> CategoriesResponse:
    breakdown = get_category_breakdown(db)
    return CategoriesResponse(
        categories=breakdown,
        total_spending=get_total_spending(db),
    )
