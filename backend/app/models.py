import enum
from datetime import datetime, date, time

from sqlalchemy import (
    Column, Integer, String, DateTime, Date, Time, Text,
    ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


class CategoryLabel(str, enum.Enum):
    productive = "productive"
    neutral = "neutral"
    unproductive = "unproductive"


class GoalPeriod(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    color = Column(String(7), nullable=False)
    label = Column(SAEnum(CategoryLabel, name="categorylabel", create_constraint=False, native_enum=False), nullable=False)

    log_entries = relationship("LogEntry", back_populates="category", cascade="all, delete-orphan")
    planned_blocks = relationship("PlannedBlock", back_populates="category", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="category", cascade="all, delete-orphan")


class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="log_entries")


class PlannedBlock(Base):
    __tablename__ = "planned_blocks"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    category = relationship("Category", back_populates="planned_blocks")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    target_minutes = Column(Integer, nullable=False)
    period = Column(SAEnum(GoalPeriod, name="goalperiod", create_constraint=False, native_enum=False), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="goals")
