"""Request checks shared by the routers. Each raises an HTTPException with a
message the frontend can show as-is."""
from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Category, LogEntry


def require_category(db: Session, category_id: int) -> Category:
    obj = db.get(Category, category_id)
    if not obj:
        raise HTTPException(status_code=422, detail=f"Category {category_id} does not exist")
    return obj


def require_order(start, end) -> None:
    if end <= start:
        raise HTTPException(status_code=422, detail="End time must be after start time")


def ensure_no_log_overlap(
    db: Session, start: datetime, end: datetime, exclude_id: Optional[int] = None
) -> None:
    """Each moment of the day can only be logged once, otherwise totals double count."""
    q = db.query(LogEntry).filter(LogEntry.start_time < end, LogEntry.end_time > start)
    if exclude_id is not None:
        q = q.filter(LogEntry.id != exclude_id)
    clash = q.order_by(LogEntry.start_time).first()
    if clash:
        raise HTTPException(
            status_code=409,
            detail=(
                f'Overlaps "{clash.title}" '
                f"({clash.start_time:%Y-%m-%d %H:%M} – {clash.end_time:%H:%M}). "
                "Adjust the times so entries don't overlap."
            ),
        )
