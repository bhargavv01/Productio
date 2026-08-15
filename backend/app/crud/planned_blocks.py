from datetime import date
from typing import Optional

from sqlalchemy.orm import Session, joinedload

from app.models import PlannedBlock
from app.schemas import PlannedBlockCreate, PlannedBlockUpdate


def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filter_date: Optional[date] = None,
) -> list[PlannedBlock]:
    q = db.query(PlannedBlock).options(joinedload(PlannedBlock.category))
    if filter_date:
        q = q.filter(PlannedBlock.date == filter_date)
    return q.order_by(PlannedBlock.start_time).offset(skip).limit(limit).all()


def get_by_id(db: Session, block_id: int) -> PlannedBlock | None:
    return (
        db.query(PlannedBlock)
        .options(joinedload(PlannedBlock.category))
        .filter(PlannedBlock.id == block_id)
        .first()
    )


def create(db: Session, data: PlannedBlockCreate) -> PlannedBlock:
    obj = PlannedBlock(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    db.refresh(obj, attribute_names=["category"])
    return obj


def update(db: Session, block_id: int, data: PlannedBlockUpdate) -> PlannedBlock | None:
    obj = db.query(PlannedBlock).filter(PlannedBlock.id == block_id).first()
    if not obj:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    db.refresh(obj, attribute_names=["category"])
    return obj


def delete(db: Session, block_id: int) -> bool:
    obj = db.query(PlannedBlock).filter(PlannedBlock.id == block_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
