import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.task_instance import TaskInstance
from models.task import Task
from models.skill import Skill
from schemas.task import TaskInstanceResponse, TaskInstanceUpdate, TaskCompleteResponse
from auth.jwt import get_current_user
from services.task_service import TaskService
from services.xp_service import XPService
from services.skill_service import SkillService
from services.streak_service import StreakService
from services.productivity_service import ProductivityService
from services.achievement_service import AchievementService
from services.mission_service import MissionService

router = APIRouter(prefix="/instances", tags=["Task Instances"])

@router.get("/today", response_model=List[TaskInstanceResponse])
def get_today_instances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.date.today()
    instances = TaskService.sync_instances_for_date(db, current_user.id, today)
    return instances

@router.get("/date/{date_str}", response_model=List[TaskInstanceResponse])
def get_instances_for_date(
    date_str: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        target_date = datetime.date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    
    # If today or past, sync instances
    instances = TaskService.sync_instances_for_date(db, current_user.id, target_date)
    return instances

@router.post("/{instance_id}/complete", response_model=TaskCompleteResponse)
def complete_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    instance = (
        db.query(TaskInstance)
        .join(Task, TaskInstance.task_id == Task.id)
        .filter(TaskInstance.id == instance_id, TaskInstance.user_id == current_user.id)
        .first()
    )
    if not instance:
        raise HTTPException(status_code=404, detail="Task instance not found")

    if instance.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Task already marked completed")

    # 1. Lock in the XP awarded permanently and immutably
    earned_xp = instance.task.xp_reward
    instance.xp_awarded = earned_xp
    instance.status = "COMPLETED"
    instance.completed_at = datetime.datetime.utcnow()
    # If actual duration wasn't logged via timer, set to planned duration
    if instance.actual_duration <= 0:
        instance.actual_duration = instance.planned_duration

    db.commit()

    # 2. Award User Total XP & Calculate Level Up
    new_total_xp, old_lvl, new_lvl, did_level_up = XPService.award_xp(current_user.total_xp, earned_xp)
    current_user.total_xp = new_total_xp
    current_user.level = new_lvl
    db.commit()

    # 3. Award Skill XP if skill is associated
    skill_name = None
    skill_xp_earned = 0
    skill_new_level = 1
    did_skill_level_up = False
    if instance.task.skill_id:
        skill_name, skill_xp, skill_new_level, did_skill_level_up = SkillService.add_skill_xp(
            db, current_user.id, instance.task.skill_id, earned_xp
        )
        skill_xp_earned = earned_xp

    # 4. Update Streak with Rest Day protection
    StreakService.update_streak_on_completion(db, current_user, instance.occurrence_date)

    # 5. Recalculate daily productivity score
    score_data = ProductivityService.calculate_daily_score(db, current_user.id, instance.occurrence_date)

    # 6. Check and unlock achievements
    unlocked = AchievementService.check_and_unlock(db, current_user)

    # 7. Sync daily missions
    MissionService.get_or_create_daily_mission(db, current_user, instance.occurrence_date)

    db.refresh(instance)
    db.refresh(current_user)

    return {
        "instance": instance,
        "xp_earned": earned_xp,
        "new_total_xp": current_user.total_xp,
        "previous_level": old_lvl,
        "new_level": new_lvl,
        "did_level_up": did_level_up,
        "skill_name": skill_name,
        "skill_xp_earned": skill_xp_earned,
        "skill_new_level": skill_new_level,
        "did_skill_level_up": did_skill_level_up,
        "current_streak": current_user.current_streak,
        "unlocked_achievements": unlocked,
        "productivity_score": score_data["total_score"],
    }

@router.post("/{instance_id}/uncomplete", response_model=TaskInstanceResponse)
def uncomplete_instance(
    instance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    instance = (
        db.query(TaskInstance)
        .filter(TaskInstance.id == instance_id, TaskInstance.user_id == current_user.id)
        .first()
    )
    if not instance:
        raise HTTPException(status_code=404, detail="Task instance not found")

    if instance.status != "COMPLETED":
        return instance

    # Revert completion
    awarded = instance.xp_awarded
    instance.status = "PENDING"
    instance.xp_awarded = 0
    instance.completed_at = None

    # Deduct XP if needed
    current_user.total_xp = max(0, current_user.total_xp - awarded)
    current_user.level = XPService.calculate_level_from_xp(current_user.total_xp)

    # Revert skill XP if applicable
    if instance.task.skill_id:
        user_skill = SkillService.get_user_skills_detail(db, current_user.id)
        # deduct safely
        from models.skill import UserSkill
        us = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id, 
            UserSkill.skill_id == instance.task.skill_id
        ).first()
        if us:
            us.xp = max(0, us.xp - awarded)
            us.level = XPService.calculate_level_from_xp(us.xp)

    db.commit()

    ProductivityService.calculate_daily_score(db, current_user.id, instance.occurrence_date)
    db.refresh(instance)
    return instance

@router.put("/{instance_id}", response_model=TaskInstanceResponse)
def update_instance(
    instance_id: int,
    data: TaskInstanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    instance = (
        db.query(TaskInstance)
        .filter(TaskInstance.id == instance_id, TaskInstance.user_id == current_user.id)
        .first()
    )
    if not instance:
        raise HTTPException(status_code=404, detail="Task instance not found")

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(instance, k, v)

    db.commit()
    db.refresh(instance)
    return instance
