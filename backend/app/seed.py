import logging

from sqlalchemy.orm import Session

from app.models import Category, CategoryLabel

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    {"name": "Work", "color": "#3B82F6", "label": CategoryLabel.productive},
    {"name": "Study", "color": "#8B5CF6", "label": CategoryLabel.productive},
    {"name": "Health", "color": "#10B981", "label": CategoryLabel.productive},
    {"name": "Social", "color": "#F59E0B", "label": CategoryLabel.neutral},
    {"name": "Entertainment", "color": "#EF4444", "label": CategoryLabel.unproductive},
    {"name": "Chores", "color": "#6B7280", "label": CategoryLabel.neutral},
]


def seed_categories(db: Session) -> None:
    """Idempotent: only inserts categories that don't already exist."""
    existing = {c.name for c in db.query(Category.name).all()}
    added = 0
    for cat_data in DEFAULT_CATEGORIES:
        if cat_data["name"] not in existing:
            db.add(Category(**cat_data))
            added += 1
    if added:
        db.commit()
        logger.info(f"Seeded {added} default categories.")
    else:
        logger.info("All default categories already exist. Skipping seed.")
