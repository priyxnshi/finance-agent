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
import statistics
from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.goal import Goal
from app.schemas.analytics import (
    CategoryBreakdownItem,
    SummaryResponse,
    MonthlyTrendPoint,
    TrendsResponse,
    CategoriesResponse,
    HeatmapDay,
    HeatmapResponse,
    HealthScoreFactor,
    HealthScoreResponse,
    MonthlySummaryResponse,
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


def get_category_breakdown(
    db: Session, start: Optional[date] = None, end: Optional[date] = None
) -> list[CategoryBreakdownItem]:
    query = select(
        Expense.category,
        func.coalesce(func.sum(Expense.amount), 0.0).label("total"),
        func.count(Expense.id).label("count"),
    )
    if start:
        query = query.where(Expense.date >= start)
    if end:
        query = query.where(Expense.date <= end)
    query = query.group_by(Expense.category)

    rows = db.execute(query).all()

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


def get_top_category(
    db: Session, start: Optional[date] = None, end: Optional[date] = None
) -> tuple[Optional[str], float]:
    breakdown = get_category_breakdown(db, start=start, end=end)
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


# --- Phase 3: heatmap ----------------------------------------------------


def build_heatmap(db: Session, days: int = 365, today: Optional[date] = None) -> HeatmapResponse:
    """
    Daily spending totals for the last `days` days. Only days with at least
    one transaction are included — react-calendar-heatmap renders the full
    date grid itself and treats missing dates as empty, so there's no need
    to pad in zero-spend days here.
    """
    today = today or date.today()
    start = today - timedelta(days=days - 1)

    rows = db.execute(
        select(
            Expense.date,
            func.coalesce(func.sum(Expense.amount), 0.0).label("total"),
            func.count(Expense.id).label("count"),
        )
        .where(Expense.date >= start, Expense.date <= today)
        .group_by(Expense.date)
        .order_by(Expense.date.asc())
    ).all()

    day_entries = [
        HeatmapDay(date=row.date, total=float(row.total), transaction_count=int(row.count)) for row in rows
    ]
    max_daily_total = max((d.total for d in day_entries), default=0.0)

    return HeatmapResponse(days=day_entries, max_daily_total=max_daily_total)


# --- Phase 3: budget health score -----------------------------------------
#
# Deterministic heuristic, not ML — four factors, each scored 0-100, combined
# with fixed weights. Each factor degrades gracefully to a neutral 70 when
# there isn't enough data yet, so a brand-new account doesn't show a
# misleadingly bad (or good) score.


def _trend_factor(db: Session, today: date) -> HealthScoreFactor:
    growth, _, previous_total = get_spending_growth_percent(db, today)
    if growth is None:
        score = 70.0
        description = "Not enough spending history yet to measure month-over-month trend."
    else:
        # Flat or falling spending scores well; each 1% of growth costs 2 points.
        score = max(0.0, min(100.0, 100 - growth * 2))
        direction = "down" if growth < 0 else "up"
        description = f"Spending is {direction} {abs(growth):.1f}% vs last month."
    return HealthScoreFactor(name="Spending Trend", score=round(score, 1), weight=0.35, description=description)


def _consistency_factor(db: Session, today: date) -> HealthScoreFactor:
    weekly_totals = []
    for i in range(8):
        week_end = today - timedelta(days=7 * i)
        week_start = week_end - timedelta(days=6)
        total = _sum_amount_between(db, week_start, week_end)
        if total > 0:
            weekly_totals.append(total)

    if len(weekly_totals) < 3:
        score = 70.0
        description = "Not enough weekly history yet to measure spending consistency."
    else:
        mean = statistics.mean(weekly_totals)
        stdev = statistics.pstdev(weekly_totals)
        coefficient_of_variation = (stdev / mean) if mean else 0
        score = max(0.0, min(100.0, 100 - coefficient_of_variation * 100))
        description = "Weekly spending is fairly steady." if score >= 70 else "Weekly spending varies a lot."
    return HealthScoreFactor(name="Spending Consistency", score=round(score, 1), weight=0.25, description=description)


def _category_concentration_factor(db: Session) -> HealthScoreFactor:
    breakdown = get_category_breakdown(db)
    if len(breakdown) < 2:
        score = 70.0
        description = "Not enough category history yet to measure spending concentration."
    else:
        # Herfindahl-style concentration index: sum of squared category shares.
        # 1.0 = all spend in one category, ~1/n = spread evenly across n categories.
        concentration = sum((item.percentage / 100) ** 2 for item in breakdown)
        score = max(0.0, min(100.0, 100 - concentration * 100))
        description = (
            "Spending is concentrated in one or two categories."
            if score < 60
            else "Spending is reasonably spread across categories."
        )
    return HealthScoreFactor(
        name="Category Diversification", score=round(score, 1), weight=0.20, description=description
    )


def _goal_progress_factor(db: Session, today: date) -> HealthScoreFactor:
    # Imported here (not at module top) to avoid a circular import, since
    # goal_service doesn't need anything from analytics_service.
    from app.services.goal_service import compute_goal_progress

    goals = list(db.scalars(select(Goal)))
    if not goals:
        score = 70.0
        description = "No savings goals set yet."
    else:
        progresses = [compute_goal_progress(g, today).progress_percent for g in goals]
        score = sum(progresses) / len(progresses)
        description = f"Average progress across {len(goals)} goal(s): {score:.0f}%."
    return HealthScoreFactor(name="Goal Progress", score=round(score, 1), weight=0.20, description=description)


def build_health_score(db: Session, today: Optional[date] = None) -> HealthScoreResponse:
    today = today or date.today()

    factors = [
        _trend_factor(db, today),
        _consistency_factor(db, today),
        _category_concentration_factor(db),
        _goal_progress_factor(db, today),
    ]

    overall = sum(f.score * f.weight for f in factors)
    overall = round(max(0.0, min(100.0, overall)))

    if overall >= 85:
        label = "Excellent"
    elif overall >= 70:
        label = "Good"
    elif overall >= 50:
        label = "Fair"
    else:
        label = "Needs Attention"

    return HealthScoreResponse(score=overall, label=label, factors=factors)


# --- Phase 3: monthly summary ----------------------------------------------


def build_monthly_summary(db: Session, today: Optional[date] = None) -> MonthlySummaryResponse:
    today = today or date.today()
    start, _ = _month_range(today.year, today.month)

    total_spent = get_monthly_spending(db, today)
    days_elapsed = max((today - start).days + 1, 1)
    average_daily_spend = round(total_spent / days_elapsed, 2)

    count_result = db.scalar(
        select(func.count(Expense.id)).where(Expense.date >= start, Expense.date <= today)
    )
    transaction_count = int(count_result or 0)

    top_category, top_category_amount = get_top_category(db, start=start, end=today)
    growth, _, _ = get_spending_growth_percent(db, today)

    return MonthlySummaryResponse(
        month=f"{today.year:04d}-{today.month:02d}",
        total_spent=total_spent,
        transaction_count=transaction_count,
        average_daily_spend=average_daily_spend,
        top_category=top_category,
        top_category_amount=top_category_amount,
        change_vs_previous_month_percent=growth,
    )
