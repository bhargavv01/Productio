import calendar
from collections import defaultdict
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import LogEntry
from app.schemas import CategoryMinutes, DayReport, WeekReport, MonthReport

router = APIRouter(prefix="/reports", tags=["reports"])


def _build_day_reports(db: Session, first: date, num_days: int) -> list[DayReport]:
    """Build one DayReport per day in [first, first + num_days).

    Entries are clipped at midnight, so an entry from 23:00 to 01:00 counts
    60 minutes towards each day instead of 120 towards the first one.
    """
    range_start = datetime.combine(first, time.min)
    range_end = range_start + timedelta(days=num_days)
    entries = (
        db.query(LogEntry)
        .options(joinedload(LogEntry.category))
        .filter(LogEntry.start_time < range_end, LogEntry.end_time > range_start)
        .all()
    )

    # minutes[day][category_id]
    minutes: dict[date, dict[int, float]] = defaultdict(lambda: defaultdict(float))
    categories = {}
    for entry in entries:
        categories[entry.category_id] = entry.category
        cursor = max(entry.start_time, range_start)
        end = min(entry.end_time, range_end)
        while cursor < end:
            next_midnight = datetime.combine(cursor.date() + timedelta(days=1), time.min)
            chunk_end = min(end, next_midnight)
            minutes[cursor.date()][entry.category_id] += (chunk_end - cursor).total_seconds() / 60
            cursor = chunk_end

    reports = []
    for i in range(num_days):
        day = first + timedelta(days=i)
        day_categories = sorted(
            (
                CategoryMinutes(
                    category_id=cat_id,
                    name=categories[cat_id].name,
                    color=categories[cat_id].color,
                    label=categories[cat_id].label,
                    minutes=round(mins, 1),
                )
                for cat_id, mins in minutes[day].items()
            ),
            key=lambda c: c.minutes,
            reverse=True,
        )
        total = sum(c.minutes for c in day_categories)
        reports.append(DayReport(date=day, total_minutes=round(total, 1), categories=day_categories))
    return reports


@router.get("/day", response_model=DayReport)
def report_day(
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    return _build_day_reports(db, date, 1)[0]


@router.get("/week", response_model=WeekReport)
def report_week(
    start: date = Query(..., description="Start date (Monday) in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    days = _build_day_reports(db, start, 7)
    return WeekReport(start=start, end=start + timedelta(days=6), days=days)


@router.get("/month", response_model=MonthReport)
def report_month(
    year: int = Query(..., ge=1970, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    num_days = calendar.monthrange(year, month)[1]
    days = _build_day_reports(db, date(year, month, 1), num_days)
    return MonthReport(year=year, month=month, days=days)
