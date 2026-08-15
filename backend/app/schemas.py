from datetime import datetime, date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import CategoryLabel, GoalPeriod


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: str
    color: str
    label: CategoryLabel


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    label: Optional[CategoryLabel] = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- LogEntry ----------
class LogEntryBase(BaseModel):
    category_id: int
    title: str
    start_time: datetime
    end_time: datetime
    note: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    note: Optional[str] = None


class LogEntryRead(LogEntryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    category: CategoryRead


# ---------- PlannedBlock ----------
class PlannedBlockBase(BaseModel):
    date: date
    category_id: int
    title: str
    start_time: time
    end_time: time


class PlannedBlockCreate(PlannedBlockBase):
    pass


class PlannedBlockUpdate(BaseModel):
    date: Optional[date] = None
    category_id: Optional[int] = None
    title: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class PlannedBlockRead(PlannedBlockBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: CategoryRead


# ---------- Goal ----------
class GoalBase(BaseModel):
    category_id: int
    target_minutes: int
    period: GoalPeriod


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    category_id: Optional[int] = None
    target_minutes: Optional[int] = None
    period: Optional[GoalPeriod] = None


class GoalRead(GoalBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    category: CategoryRead


# ---------- Reports ----------
class CategoryMinutes(BaseModel):
    category_id: int
    name: str
    color: str
    label: CategoryLabel
    minutes: float


class DayReport(BaseModel):
    date: date
    total_minutes: float
    categories: list[CategoryMinutes]


class WeekReport(BaseModel):
    start: date
    end: date
    days: list[DayReport]


class MonthReport(BaseModel):
    year: int
    month: int
    days: list[DayReport]
