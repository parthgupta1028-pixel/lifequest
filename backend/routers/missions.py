import datetime
import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.gamification import DailyMissionResponse, AchievementResponse
from auth.jwt import get_current_user
from services.mission_service import MissionService
from services.achievement_service import AchievementService

missions_router = APIRouter(prefix="/missions", tags=["Missions"])

@missions_router.get("/today", response_model=DailyMissionResponse)
def get_today_mission(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    mission = MissionService.get_or_create_daily_mission(db, current_user, today)
    items = json.loads(mission.items_json) if mission.items_json else []
    return {
        "id": mission.id,
        "mission_date": mission.mission_date,
        "title": mission.title,
        "description": mission.description,
        "xp_reward": mission.xp_reward,
        "is_completed": mission.is_completed,
        "is_claimed": mission.is_claimed,
        "completed_at": mission.completed_at,
        "items": items,
    }

@missions_router.post("/today/claim")
def claim_mission(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    return MissionService.claim_mission_reward(db, current_user, today)


achievements_router = APIRouter(prefix="/achievements", tags=["Achievements"])

@achievements_router.get("", response_model=List[AchievementResponse])
def get_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AchievementService.get_all_achievements_for_user(db, current_user.id)
