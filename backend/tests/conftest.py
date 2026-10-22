"""Tests run against a separate `productio_test` database on the same Postgres
server as DATABASE_URL, migrated with Alembic, and emptied before each test."""
import os

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from app.config import settings

TEST_DB = "productio_test"
_base_url = make_url(settings.DATABASE_URL)
settings.DATABASE_URL = _base_url.set(database=TEST_DB).render_as_string(hide_password=False)

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_categories  # noqa: E402

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))


@pytest.fixture(scope="session", autouse=True)
def database():
    admin = create_engine(_base_url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    try:
        with admin.connect() as conn:
            conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
            conn.execute(text(f"CREATE DATABASE {TEST_DB}"))
    except Exception as exc:  # pragma: no cover
        pytest.exit(f"Postgres is not reachable for tests: {exc}", returncode=1)

    cfg = Config(os.path.join(BACKEND_DIR, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(BACKEND_DIR, "alembic"))
    command.upgrade(cfg, "head")
    yield
    engine.dispose()
    with admin.connect() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
    admin.dispose()


@pytest.fixture(autouse=True)
def clean_tables():
    with engine.begin() as conn:
        conn.execute(text(
            "TRUNCATE log_entries, planned_blocks, goals, categories RESTART IDENTITY CASCADE"
        ))
    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def cat_ids(client):
    return {c["name"]: c["id"] for c in client.get("/categories/").json()}
