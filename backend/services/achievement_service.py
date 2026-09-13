import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.achievement import Achievement, UserAchievement
from models.user import User
from models.task_instance import TaskInstance
from models.task import Task
from models.skill import Skill, UserSkill
from models.daily_stat import DailyStat
from services.xp_service import XPService

INITIAL_ACHIEVEMENTS = [
    {
        "code": "first_task",
        "title": "First Step of the Hero",
        "description": "Complete your very first task in LifeQuest.",
        "icon": "shield",
        "category": "GENERAL",
        "xp_bonus": 25,
        "requirement_type": "tasks_completed",
        "requirement_value": 1,
    },
    {
        "code": "first_100_xp",
        "title": "Centurion",
        "description": "Amass your first 100 total XP points.",
        "icon": "award",
        "category": "LEVEL",
        "xp_bonus": 50,
        "requirement_type": "total_xp",
        "requirement_value": 100,
    },
    {
        "code": "streak_7",
        "title": "Sevenfold Fire",
        "description": "Maintain an uninterrupted 7-day productive streak.",
        "icon": "flame",
        "category": "STREAK",
        "xp_bonus": 150,
        "requirement_type": "streak_days",
        "requirement_value": 7,
    },
    {
        "code": "coding_10h",
        "title": "Master of Syntax",
        "description": "Accumulate 10 productive hours (600 minutes) in Coding.",
        "icon": "code",
        "category": "SKILL",
        "xp_bonus": 200,
        "requirement_type": "coding_minutes",
        "requirement_value": 600,
    },
    {
        "code": "study_20",
        "title": "Scholar's Dedication",
        "description": "Successfully complete 20 Study sessions.",
        "icon": "book-open",
        "category": "SKILL",
        "xp_bonus": 200,
        "requirement_type": "study_tasks",
        "requirement_value": 20,
    },
    {
        "code": "level_10",
        "title": "Ascended Paragon",
        "description": "Attain character Level 10.",
        "icon": "crown",
        "category": "LEVEL",
        "xp_bonus": 300,
        "requirement_type": "level",
        "requirement_value": 10,
    },
    {
        "code": "streak_30",
        "title": "Unstoppable Momentum",
        "description": "Log 30 productive days on your LifeQuest journey.",
        "icon": "zap",
        "category": "STREAK",
        "xp_bonus": 500,
        "requirement_type": "productive_days",
        "requirement_value": 30,
    },
]

class AchievementService:
    @staticmethod
    def ensure_default_achievements(db: Session):
        for ach in INITIAL_ACHIEVEMENTS:
            existing = db.query(Achievement).filter(Achievement.code == ach["code"]).first()
            if not existing:
                db.add(Achievement(**ach))
        db.commit()

    @staticmethod
    def check_and_unlock(db: Session, user: User) -> List[Dict[str, Any]]:
        """
        Evaluates user stats and unlocks newly satisfied achievements.
        Awards bonus XP and returns list of newly unlocked achievements.
        """
        AchievementService.ensure_default_achievements(db)

        # Get all achievements
        all_achievements = db.query(Achievement).all()
        user_unlocked_ids = {
            ua.achievement_id 
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        }

        # Calculate metrics
        total_completed_tasks = (
            db.query(TaskInstance)
            .filter(TaskInstance.user_id == user.id, TaskInstance.status == "COMPLETED")
            .count()
        )

        productive_days = (
            db.query(DailyStat)
            .filter(DailyStat.user_id == user.id, DailyStat.tasks_completed > 0)
            .count()
        )

        # Coding minutes
        coding_skill = db.query(Skill).filter(Skill.name == "Coding").first()
        coding_minutes = 0
        if coding_skill:
            coding_instances = (
                db.query(TaskInstance)
                .join(Task, TaskInstance.task_id == Task.id)
                .filter(
                    TaskInstance.user_id == user.id,
                    TaskInstance.status == "COMPLETED",
                    Task.skill_id == coding_skill.id
                )
                .all()
            )
            coding_minutes = sum(inst.actual_duration or inst.planned_duration for inst in coding_instances)

        # Study tasks
        study_skill = db.query(Skill).filter(Skill.name == "Study").first()
        study_tasks = 0
        if study_skill:
            study_tasks = (
                db.query(TaskInstance)
                .join(Task, TaskInstance.task_id == Task.id)
                .filter(
                    TaskInstance.user_id == user.id,
                    TaskInstance.status == "COMPLETED",
                    Task.skill_id == study_skill.id
                )
                .count()
            )

        newly_unlocked = []

        for ach in all_achievements:
            if ach.id in user_unlocked_ids:
                continue

            unlocked = False
            req_type = ach.requirement_type
            req_val = ach.requirement_value

            if req_type == "tasks_completed" and total_completed_tasks >= req_val:
                unlocked = True
            elif req_type == "total_xp" and user.total_xp >= req_val:
                unlocked = True
            elif req_type == "streak_days" and user.best_streak >= req_val:
                unlocked = True
            elif req_type == "coding_minutes" and coding_minutes >= req_val:
                unlocked = True
            elif req_type == "study_tasks" and study_tasks >= req_val:
                unlocked = True
            elif req_type == "level" and user.level >= req_val:
                unlocked = True
            elif req_type == "productive_days" and productive_days >= req_val:
                unlocked = True

            if unlocked:
                ua = UserAchievement(
                    user_id=user.id,
                    achievement_id=ach.id,
                    unlocked_at=datetime.datetime.utcnow()
                )
                db.add(ua)
                
                # Award bonus XP for achievement
                user.total_xp, _, user.level, _ = XPService.award_xp(user.total_xp, ach.xp_bonus)
                db.commit()

                newly_unlocked.append({
                    "id": ach.id,
                    "code": ach.code,
                    "title": ach.title,
                    "description": ach.description,
                    "icon": ach.icon,
                    "xp_bonus": ach.xp_bonus,
                })

        return newly_unlocked

    @staticmethod
    def get_all_achievements_for_user(db: Session, user_id: int) -> List[Dict[str, Any]]:
        AchievementService.ensure_default_achievements(db)
        achievements = db.query(Achievement).all()
        user_achievements = {
            ua.achievement_id: ua.unlocked_at
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
        }

        result = []
        for ach in achievements:
            unlocked = ach.id in user_achievements
            result.append({
                "id": ach.id,
                "code": ach.code,
                "title": ach.title,
                "description": ach.description,
                "icon": ach.icon,
                "category": ach.category,
                "xp_bonus": ach.xp_bonus,
                "requirement_type": ach.requirement_type,
                "requirement_value": ach.requirement_value,
                "is_unlocked": unlocked,
                "unlocked_at": user_achievements.get(ach.id)
            })
        return result
