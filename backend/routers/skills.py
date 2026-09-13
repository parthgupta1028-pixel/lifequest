from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.daily_stat import RestDay
from schemas.gamification import (
    HexagonRadarData, 
    RestDayCreate, 
    RestDayResponse,
    SkillCreate,
    SkillUpdate,
    UserSkillResponse
)
from auth.jwt import get_current_user
from services.skill_service import SkillService
from services.streak_service import StreakService
from services.productivity_service import ProductivityService

skills_router = APIRouter(prefix="/skills", tags=["Skills"])

@skills_router.get("/radar", response_model=List[HexagonRadarData])
def get_skills_radar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SkillService.get_radar_data(db, current_user.id)

@skills_router.get("/detail", response_model=List[UserSkillResponse])
def get_skills_detail(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SkillService.get_user_skills_detail(db, current_user.id)

@skills_router.post("", response_model=UserSkillResponse)
def create_skill(
    data: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SkillService.create_user_skill(
        db,
        user_id=current_user.id,
        name=data.name,
        description=data.description or "",
        icon=data.icon or "zap",
        color=data.color or "#10B981"
    )

@skills_router.put("/{skill_id}", response_model=UserSkillResponse)
def update_skill(
    skill_id: int,
    data: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = SkillService.update_user_skill(
        db,
        user_id=current_user.id,
        skill_id=skill_id,
        name=data.name,
        description=data.description,
        icon=data.icon,
        color=data.color
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Skill not found")
    return updated

@skills_router.post("/{skill_id}/toggle", response_model=UserSkillResponse)
def toggle_skill_active(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    toggled = SkillService.toggle_user_skill(db, current_user.id, skill_id)
    if not toggled:
        raise HTTPException(status_code=404, detail="Skill not found")
    return toggled

@skills_router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = SkillService.delete_user_skill(db, current_user.id, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"success": True, "message": "Skill deleted successfully. Associated historical records preserved."}


streaks_router = APIRouter(prefix="/streaks", tags=["Streaks"])

@streaks_router.get("")
def get_streak_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return StreakService.get_streak_summary(db, current_user)


rest_days_router = APIRouter(prefix="/rest-days", tags=["Rest Days"])

@rest_days_router.get("", response_model=List[RestDayResponse])
def list_rest_days(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(RestDay)
        .filter(RestDay.user_id == current_user.id)
        .order_by(RestDay.rest_date.desc())
        .all()
    )

@rest_days_router.post("", response_model=RestDayResponse)
def add_rest_day(
    data: RestDayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = (
        db.query(RestDay)
        .filter(RestDay.user_id == current_user.id, RestDay.rest_date == data.rest_date)
        .first()
    )
    if existing:
        return existing

    rest = RestDay(
        user_id=current_user.id,
        rest_date=data.rest_date,
        note=data.note
    )
    db.add(rest)
    db.commit()
    db.refresh(rest)

    # Recalculate daily score for rest day
    ProductivityService.calculate_daily_score(db, current_user.id, data.rest_date)

    return rest

@rest_days_router.delete("/{date_str}")
def remove_rest_day(
    date_str: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        target_date = datetime.date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    rest = (
        db.query(RestDay)
        .filter(RestDay.user_id == current_user.id, RestDay.rest_date == target_date)
        .first()
    )
    if not rest:
        raise HTTPException(status_code=404, detail="Rest day not found")

    db.delete(rest)
    db.commit()

    # Recalculate daily score
    ProductivityService.calculate_daily_score(db, current_user.id, target_date)

    return {"success": True, "message": "Rest day removed"}
