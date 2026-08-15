import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.seed import seed_categories
from app.routers import categories, log_entries, planned_blocks, goals, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed default categories on startup
    logger.info("Running startup seed...")
    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Productio — Personal Day Tracker",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(categories.router)
app.include_router(log_entries.router)
app.include_router(planned_blocks.router)
app.include_router(goals.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Productio API is running"}
