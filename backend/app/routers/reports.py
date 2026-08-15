import calendar
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, extract

from app.database import get_db
from app.models import LogEntry, Category
from app.schemas import CategoryMinutes, DayReport, WeekReport, MonthReport

router = APIRouter(prefix="/reports", tags=["reports"])


def _build_day_report(db: Session, target_date: date) -> DayReport:
    """Build a DayReport for a single date by summing log entry durations per category."""
    results = (
        db.query(
            Category.id,
            Category.name,
            Category.color,
            Category.label,
            func.coalesce(
                func.sum(
                    extract("epoch", LogEntry.end_time - LogEntry.start_time) / 60.0
                ),
                0,
            ).label("minutes"),
        )
        .join(LogEntry, LogEntry.category_id == Category.id)
        .filter(cast(LogEntry.start_time, Date) == target_date)
        .group_by(Category.id, Category.name, Category.color, Category.label)
        .all()
    )

    categories = [
        CategoryMinutes(
            category_id=r.id,
            name=r.name,
            color=r.color,
            label=r.label,
            minutes=round(float(r.minutes), 1),
        )
        for r in results
    ]
    total = sum(c.minutes for c in categories)

    return DayReport(date=target_date, total_minutes=round(total, 1), categories=categories)


@router.get("/day", response_model=DayReport)
def report_day(
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    return _build_day_report(db, date)


@router.get("/week", response_model=WeekReport)
def report_week(
    start: date = Query(..., description="Start date (Monday) in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    days = [_build_day_report(db, start + timedelta(days=i)) for i in range(7)]
    return WeekReport(start=start, end=start + timedelta(days=6), days=days)


@router.get("/month", response_model=MonthReport)
def report_month(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    num_days = calendar.monthrange(year, month)[1]
    days = [
        _build_day_report(db, date(year, month, d))
        for d in range(1, num_days + 1)
    ]
    return MonthReport(year=year, month=month, days=days)
