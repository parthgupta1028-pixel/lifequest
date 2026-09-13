from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from database import engine, Base, SessionLocal
import models  # ensures all models registered
from routers.auth import router as auth_router
from routers.categories import router as categories_router
from routers.tasks import router as tasks_router
from routers.instances import router as instances_router
from routers.timers import router as timers_router
from routers.skills import skills_router, streaks_router, rest_days_router
from routers.missions import missions_router, achievements_router
from routers.analytics import router as analytics_router
from routers.dashboard import router as dashboard_router
from routers.admin import router as admin_router
from services.skill_service import SkillService
from services.task_service import TaskService
from services.achievement_service import AchievementService
from migrate_db import run_migration

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure migration applied, create tables and seed system defaults
    try:
        run_migration()
    except Exception as e:
        print(f"[STARTUP] Migration warning: {e}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SkillService.ensure_default_skills(db)
        TaskService.ensure_default_categories(db)
        AchievementService.ensure_default_achievements(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS middleware for React / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server on any port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(categories_router, prefix=api_prefix)
app.include_router(tasks_router, prefix=api_prefix)
app.include_router(instances_router, prefix=api_prefix)
app.include_router(timers_router, prefix=api_prefix)
app.include_router(skills_router, prefix=api_prefix)
app.include_router(streaks_router, prefix=api_prefix)
app.include_router(rest_days_router, prefix=api_prefix)
app.include_router(missions_router, prefix=api_prefix)
app.include_router(achievements_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)

import os
from fastapi.staticfiles import StaticFiles

@app.get("/api/health")
def health_check():
    return {
        "app": "LifeQuest API",
        "status": "online",
        "quote": "Do work -> Complete task -> Earn XP -> Level Up!",
        "docs": "/docs"
    }

# Serve production frontend if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "app": "LifeQuest API",
            "status": "online",
            "docs": "/docs",
            "frontend": "Run 'npm run build' in frontend directory to serve UI directly."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
