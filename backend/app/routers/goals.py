from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import GoalCreate, GoalUpdate, GoalRead
from app.crud import goals as crud

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("/", response_model=list[GoalRead])
def list_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all(db, skip=skip, limit=limit)


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    obj = crud.get_by_id(db, goal_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Goal not found")
    return obj


@router.post("/", response_model=GoalRead, status_code=201)
def create_goal(data: GoalCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)


@router.put("/{goal_id}", response_model=GoalRead)
def update_goal(goal_id: int, data: GoalUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, goal_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Goal not found")
    return obj


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    if not crud.delete(db, goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")
