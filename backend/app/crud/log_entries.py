from datetime import date, datetime
from typing import Optional

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, cast, Date

from app.models import LogEntry
from app.schemas import LogEntryCreate, LogEntryUpdate


def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filter_date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[LogEntry]:
    q = db.query(LogEntry).options(joinedload(LogEntry.category))
    if filter_date:
        q = q.filter(cast(LogEntry.start_time, Date) == filter_date)
    if start_date:
        q = q.filter(cast(LogEntry.start_time, Date) >= start_date)
    if end_date:
        q = q.filter(cast(LogEntry.start_time, Date) <= end_date)
    return q.order_by(LogEntry.start_time).offset(skip).limit(limit).all()


def get_by_id(db: Session, entry_id: int) -> LogEntry | None:
    return (
        db.query(LogEntry)
        .options(joinedload(LogEntry.category))
        .filter(LogEntry.id == entry_id)
        .first()
    )


def create(db: Session, data: LogEntryCreate) -> LogEntry:
    obj = LogEntry(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Eagerly load the category relationship
    db.refresh(obj, attribute_names=["category"])
    return obj


def update(db: Session, entry_id: int, data: LogEntryUpdate) -> LogEntry | None:
    obj = db.query(LogEntry).filter(LogEntry.id == entry_id).first()
    if not obj:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    db.refresh(obj, attribute_names=["category"])
    return obj


def delete(db: Session, entry_id: int) -> bool:
    obj = db.query(LogEntry).filter(LogEntry.id == entry_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
