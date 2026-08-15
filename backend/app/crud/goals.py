from sqlalchemy.orm import Session, joinedload

from app.models import Goal
from app.schemas import GoalCreate, GoalUpdate


def get_all(db: Session, skip: int = 0, limit: int = 100) -> list[Goal]:
    return (
        db.query(Goal)
        .options(joinedload(Goal.category))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_by_id(db: Session, goal_id: int) -> Goal | None:
    return (
        db.query(Goal)
        .options(joinedload(Goal.category))
        .filter(Goal.id == goal_id)
        .first()
    )


def create(db: Session, data: GoalCreate) -> Goal:
    obj = Goal(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    db.refresh(obj, attribute_names=["category"])
    return obj


def update(db: Session, goal_id: int, data: GoalUpdate) -> Goal | None:
    obj = db.query(Goal).filter(Goal.id == goal_id).first()
    if not obj:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    db.refresh(obj, attribute_names=["category"])
    return obj


def delete(db: Session, goal_id: int) -> bool:
    obj = db.query(Goal).filter(Goal.id == goal_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
