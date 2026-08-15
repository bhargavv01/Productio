from sqlalchemy.orm import Session

from app.models import Category
from app.schemas import CategoryCreate, CategoryUpdate


def get_all(db: Session, skip: int = 0, limit: int = 100) -> list[Category]:
    return db.query(Category).offset(skip).limit(limit).all()


def get_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()


def create(db: Session, data: CategoryCreate) -> Category:
    obj = Category(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, category_id: int, data: CategoryUpdate) -> Category | None:
    obj = db.query(Category).filter(Category.id == category_id).first()
    if not obj:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, category_id: int) -> bool:
    obj = db.query(Category).filter(Category.id == category_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
