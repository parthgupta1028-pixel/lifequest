import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.user import User
from models.daily_stat import DailyStat, RestDay
from models.task_instance import TaskInstance
from models.task import Task
from models.skill import Skill
from schemas.gamification import HeatmapDay
from auth.jwt import get_current_user
from services.productivity_service import ProductivityService
from services.skill_service import SkillService
from services.streak_service import StreakService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/daily")
def get_daily_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    score_data = ProductivityService.calculate_daily_score(db, current_user.id, today)
    return score_data

@router.get("/weekly")
def get_weekly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=6)

    stats = (
        db.query(DailyStat)
        .filter(DailyStat.user_id == current_user.id, DailyStat.stat_date >= start_date, DailyStat.stat_date <= today)
        .all()
    )
    stat_map = {s.stat_date: s for s in stats}

    days_data = []
    total_xp = 0
    total_tasks = 0
    total_minutes = 0

    for i in range(7):
        d = start_date + datetime.timedelta(days=i)
        st = stat_map.get(d)
        xp = st.xp_earned if st else 0
        comp = st.tasks_completed if st else 0
        mins = st.productive_time_minutes if st else 0
        score = st.productivity_score if st else 0

        total_xp += xp
        total_tasks += comp
        total_minutes += mins

        days_data.append({
            "date": d.isoformat(),
            "day_name": d.strftime("%a"),
            "xp": xp,
            "tasks_completed": comp,
            "productive_minutes": mins,
            "productivity_score": score,
        })

    return {
        "days": days_data,
        "total_xp_7d": total_xp,
        "total_tasks_7d": total_tasks,
        "total_hours_7d": round(total_minutes / 60.0, 1),
        "current_streak": current_user.current_streak,
        "best_streak": current_user.best_streak,
    }

@router.get("/monthly")
def get_monthly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=29)

    stats = (
        db.query(DailyStat)
        .filter(DailyStat.user_id == current_user.id, DailyStat.stat_date >= start_date, DailyStat.stat_date <= today)
        .all()
    )
    stat_map = {s.stat_date: s for s in stats}

    progression = []
    accum_xp = 0
    total_tasks = 0
    total_minutes = 0

    for i in range(30):
        d = start_date + datetime.timedelta(days=i)
        st = stat_map.get(d)
        xp = st.xp_earned if st else 0
        comp = st.tasks_completed if st else 0
        mins = st.productive_time_minutes if st else 0
        score = st.productivity_score if st else 0

        accum_xp += xp
        total_tasks += comp
        total_minutes += mins

        progression.append({
            "date": d.isoformat(),
            "day": d.strftime("%d %b"),
            "daily_xp": xp,
            "cumulative_xp": accum_xp,
            "tasks_completed": comp,
            "productivity_score": score,
            "productive_minutes": mins,
        })

    # Skill breakdown
    skills_data = SkillService.get_user_skills_detail(db, current_user.id)

    return {
        "progression": progression,
        "total_completed_tasks_30d": total_tasks,
        "total_productive_hours_30d": round(total_minutes / 60.0, 1),
        "total_xp_30d": accum_xp,
        "skills": skills_data,
    }

@router.get("/heatmap", response_model=List[HeatmapDay])
def get_productivity_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    # 52 weeks = 364 days
    start_date = today - datetime.timedelta(days=364)

    stats = (
        db.query(DailyStat)
        .filter(DailyStat.user_id == current_user.id, DailyStat.stat_date >= start_date, DailyStat.stat_date <= today)
        .all()
    )
    stat_map = {s.stat_date: s for s in stats}

    rest_days = (
        db.query(RestDay)
        .filter(RestDay.user_id == current_user.id, RestDay.rest_date >= start_date, RestDay.rest_date <= today)
        .all()
    )
    rest_map = {r.rest_date: True for r in rest_days}

    heatmap_cells = []
    for i in range(365):
        d = start_date + datetime.timedelta(days=i)
        st = stat_map.get(d)
        is_rest = rest_map.get(d, False)
        
        xp = st.xp_earned if st else 0
        comp = st.tasks_completed if st else 0
        mins = st.productive_time_minutes if st else 0
        score = st.productivity_score if st else (100 if is_rest else 0)

        # Intensity level: 0 (none), 1 (1-49 XP), 2 (50-99 XP), 3 (100-199 XP), 4 (200+ XP)
        if is_rest and xp == 0:
            level = 1  # Subtle indicator for Rest Day
        elif xp >= 200 or score >= 90:
            level = 4
        elif xp >= 100 or score >= 75:
            level = 3
        elif xp >= 50 or score >= 50:
            level = 2
        elif xp > 0 or comp > 0:
            level = 1
        else:
            level = 0

        heatmap_cells.append({
            "date": d.isoformat(),
            "xp": xp,
            "tasks_completed": comp,
            "productive_time": mins,
            "productivity_score": score,
            "is_rest_day": is_rest,
            "level": level,
        })

    return heatmap_cells
