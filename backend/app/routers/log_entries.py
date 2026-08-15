from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LogEntryCreate, LogEntryUpdate, LogEntryRead
from app.crud import log_entries as crud

router = APIRouter(prefix="/log-entries", tags=["log-entries"])


@router.get("/", response_model=list[LogEntryRead])
def list_log_entries(
    skip: int = 0,
    limit: int = 100,
    date: Optional[date] = Query(None, alias="date"),
    start_date: Optional[date] = Query(None, alias="start_date"),
    end_date: Optional[date] = Query(None, alias="end_date"),
    db: Session = Depends(get_db),
):
    return crud.get_all(
        db, skip=skip, limit=limit,
        filter_date=date, start_date=start_date, end_date=end_date,
    )


@router.get("/{entry_id}", response_model=LogEntryRead)
def get_log_entry(entry_id: int, db: Session = Depends(get_db)):
    obj = crud.get_by_id(db, entry_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return obj


@router.post("/", response_model=LogEntryRead, status_code=201)
def create_log_entry(data: LogEntryCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)


@router.put("/{entry_id}", response_model=LogEntryRead)
def update_log_entry(entry_id: int, data: LogEntryUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, entry_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return obj


@router.delete("/{entry_id}", status_code=204)
def delete_log_entry(entry_id: int, db: Session = Depends(get_db)):
    if not crud.delete(db, entry_id):
        raise HTTPException(status_code=404, detail="Log entry not found")
