import datetime
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.task_instance import TaskInstance
from models.task import Task
from auth.jwt import get_current_user
from services.xp_service import XPService
from services.streak_service import StreakService
from services.skill_service import SkillService
from services.productivity_service import ProductivityService
from services.mission_service import MissionService
from services.achievement_service import AchievementService
from services.task_service import TaskService
from schemas.task import TaskInstanceResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()

    # 1. Level progress
    level_prog = XPService.get_level_progress(current_user.total_xp)

    # 2. Streak summary
    streak_info = StreakService.get_streak_summary(db, current_user)

    # 3. Sync & get today's tasks
    instances = TaskService.sync_instances_for_date(db, current_user.id, today)

    # 4. Productivity score
    productivity = ProductivityService.calculate_daily_score(db, current_user.id, today)

    # 5. Quick stats
    completed_count = sum(1 for inst in instances if inst.status == "COMPLETED")
    pending_count = sum(1 for inst in instances if inst.status != "COMPLETED")
    today_xp = sum(inst.xp_awarded for inst in instances if inst.status == "COMPLETED")
    productive_minutes = sum(inst.actual_duration for inst in instances)

    # 6. Daily mission
    mission = MissionService.get_or_create_daily_mission(db, current_user, today)
    mission_items = json.loads(mission.items_json) if mission.items_json else []

    # 7. 6-Skill radar data
    radar_data = SkillService.get_radar_data(db, current_user.id)

    # 8. Recent achievements
    achievements = AchievementService.get_all_achievements_for_user(db, current_user.id)
    recent_unlocked = [a for a in achievements if a["is_unlocked"]][:4]

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "level": current_user.level,
            "total_xp": current_user.total_xp,
            "level_progress": level_prog,
        },
        "streak": streak_info,
        "productivity": productivity,
        "quick_stats": {
            "today_xp": today_xp,
            "tasks_completed": completed_count,
            "tasks_pending": pending_count,
            "productive_minutes": productive_minutes,
        },
        "today_tasks": [TaskInstanceResponse.model_validate(inst) for inst in instances],
        "daily_mission": {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "xp_reward": mission.xp_reward,
            "is_completed": mission.is_completed,
            "is_claimed": mission.is_claimed,
            "items": mission_items,
        },
        "skills_radar": radar_data,
        "recent_achievements": recent_unlocked,
    }
