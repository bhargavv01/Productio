from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LogEntry
from app.schemas import CategoryCreate, CategoryUpdate, CategoryRead
from app.crud import categories as crud

router = APIRouter(prefix="/categories", tags=["categories"])

DUPLICATE_NAME = HTTPException(status_code=409, detail="A category with that name already exists")


@router.get("/", response_model=list[CategoryRead])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: Session = Depends(get_db)):
    obj = crud.get_by_id(db, category_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return obj


@router.post("/", response_model=CategoryRead, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    try:
        return crud.create(db, data)
    except IntegrityError:
        db.rollback()
        raise DUPLICATE_NAME


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    try:
        obj = crud.update(db, category_id, data)
    except IntegrityError:
        db.rollback()
        raise DUPLICATE_NAME
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return obj


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    # Deleting a category used to silently wipe every log entry in it.
    logged = db.query(LogEntry).filter(LogEntry.category_id == category_id).count()
    if logged:
        raise HTTPException(
            status_code=409,
            detail=f"Category has {logged} log entries. Move them to another category before deleting it.",
        )
    if not crud.delete(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
