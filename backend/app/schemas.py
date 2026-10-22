from datetime import datetime, date, time
from typing import Annotated, Optional

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from app.models import CategoryLabel, GoalPeriod

MINUTES_PER_PERIOD = {GoalPeriod.daily: 24 * 60, GoalPeriod.weekly: 7 * 24 * 60}


def _to_local_naive(value: datetime) -> datetime:
    """Log times are stored as naive local wall-clock time. If a client sends an
    offset-aware value, convert it to this machine's local time and drop the offset."""
    if value.tzinfo is not None:
        return value.astimezone().replace(tzinfo=None)
    return value


LocalDateTime = Annotated[datetime, AfterValidator(_to_local_naive)]
Title = Annotated[str, Field(min_length=1, max_length=255)]
HexColor = Annotated[str, Field(pattern=r"^#[0-9A-Fa-f]{6}$")]


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    color: HexColor
    label: CategoryLabel


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = None
    color: Optional[HexColor] = None
    label: Optional[CategoryLabel] = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- LogEntry ----------
class LogEntryBase(BaseModel):
    category_id: int
    title: Title
    start_time: datetime
    end_time: datetime
    note: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    start_time: LocalDateTime
    end_time: LocalDateTime

    @model_validator(mode="after")
    def check_order(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class LogEntryUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[Title] = None
    start_time: Optional[LocalDateTime] = None
    end_time: Optional[LocalDateTime] = None
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
    title: Title
    start_time: time
    end_time: time


class PlannedBlockCreate(PlannedBlockBase):
    @model_validator(mode="after")
    def check_order(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class PlannedBlockUpdate(BaseModel):
    date: Optional[date] = None
    category_id: Optional[int] = None
    title: Optional[Title] = None
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
    target_minutes: Annotated[int, Field(gt=0)]

    @model_validator(mode="after")
    def check_fits_period(self):
        if self.target_minutes > MINUTES_PER_PERIOD[self.period]:
            raise ValueError(f"target_minutes cannot exceed the length of a {self.period.value} period")
        return self


class GoalUpdate(BaseModel):
    category_id: Optional[int] = None
    target_minutes: Optional[Annotated[int, Field(gt=0)]] = None
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
