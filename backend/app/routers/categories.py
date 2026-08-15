from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CategoryCreate, CategoryUpdate, CategoryRead
from app.crud import categories as crud

router = APIRouter(prefix="/categories", tags=["categories"])


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
    return crud.create(db, data)


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, category_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return obj


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
