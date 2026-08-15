from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PlannedBlockCreate, PlannedBlockUpdate, PlannedBlockRead
from app.crud import planned_blocks as crud

router = APIRouter(prefix="/planned-blocks", tags=["planned-blocks"])


@router.get("/", response_model=list[PlannedBlockRead])
def list_planned_blocks(
    skip: int = 0,
    limit: int = 100,
    date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    return crud.get_all(db, skip=skip, limit=limit, filter_date=date)


@router.get("/{block_id}", response_model=PlannedBlockRead)
def get_planned_block(block_id: int, db: Session = Depends(get_db)):
    obj = crud.get_by_id(db, block_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Planned block not found")
    return obj


@router.post("/", response_model=PlannedBlockRead, status_code=201)
def create_planned_block(data: PlannedBlockCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)


@router.put("/{block_id}", response_model=PlannedBlockRead)
def update_planned_block(block_id: int, data: PlannedBlockUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, block_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Planned block not found")
    return obj


@router.delete("/{block_id}", status_code=204)
def delete_planned_block(block_id: int, db: Session = Depends(get_db)):
    if not crud.delete(db, block_id):
        raise HTTPException(status_code=404, detail="Planned block not found")
