from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from models.user import User
from models.task import Task
from models.task_instance import TaskInstance
from models.skill import Skill, UserSkill
from models.daily_stat import DailyStat, RestDay
from models.achievement import UserAchievement

class AdminService:
    @staticmethod
    def get_system_stats(db: Session) -> Dict[str, Any]:
        """Calculates system-wide telemetry KPIs."""
        total_users = db.query(func.count(User.id)).scalar() or 0
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        total_tasks = db.query(func.count(Task.id)).scalar() or 0
        completed_tasks = db.query(func.count(TaskInstance.id)).filter(TaskInstance.status == "COMPLETED").scalar() or 0
        total_xp = db.query(func.sum(User.total_xp)).scalar() or 0
        
        # Productive hours from completed tasks actual duration or daily stats
        total_minutes = db.query(func.sum(TaskInstance.actual_duration)).scalar() or 0
        total_productive_hours = round(float(total_minutes) / 60.0, 1)

        total_skills = db.query(func.count(Skill.id)).scalar() or 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "total_xp_generated": total_xp,
            "total_productive_hours": total_productive_hours,
            "total_skills_created": total_skills,
        }

    @staticmethod
    def get_users_list(
        db: Session,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Fetches searchable and paginated users list with aggregate statistics."""
        query = db.query(User)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(User.username).like(term),
                    func.lower(User.email).like(term)
                )
            )

        total = query.count()
        offset = (page - 1) * limit
        users = query.order_by(User.id.asc()).offset(offset).limit(limit).all()

        user_items = []
        for u in users:
            tasks_count = db.query(func.count(Task.id)).filter(Task.user_id == u.id).scalar() or 0
            completed_tasks_count = (
                db.query(func.count(TaskInstance.id))
                .filter(TaskInstance.user_id == u.id, TaskInstance.status == "COMPLETED")
                .scalar() or 0
            )

            user_items.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role or "user",
                "is_active": u.is_active if u.is_active is not None else True,
                "level": u.level,
                "total_xp": u.total_xp,
                "current_streak": u.current_streak,
                "best_streak": u.best_streak,
                "tasks_count": tasks_count,
                "completed_tasks_count": completed_tasks_count,
                "created_at": u.created_at,
            })

        return {
            "total": total,
            "users": user_items
        }

    @staticmethod
    def toggle_user_active(db: Session, target_user_id: int, admin_id: int) -> User:
        """Toggles account activation state for a user (cannot deactivate self)."""
        if target_user_id == admin_id:
            raise ValueError("Administrators cannot deactivate their own account.")

        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise LookupError("User not found.")

        user.is_active = not (user.is_active if user.is_active is not None else True)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user_role(db: Session, target_user_id: int, new_role: str, admin_id: int) -> User:
        """Updates role of a user (cannot demote self)."""
        if target_user_id == admin_id and new_role != "admin":
            raise ValueError("Administrators cannot revoke their own admin privileges.")

        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise LookupError("User not found.")

        user.role = new_role
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def reset_user_progress(db: Session, target_user_id: int) -> User:
        """
        Resets all progress metrics for a user:
        - Total XP -> 0
        - Level -> 1
        - Current Streak -> 0
        - Best Streak -> 0
        - Last Active Date -> None
        - Resets all task instances to PENDING, xp_awarded = 0, completed_at = None
        - Resets user skills XP -> 0, level -> 1
        - Deletes daily stats, rest days, and unlocked achievements
        """
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise LookupError("User not found.")

        # 1. Reset user core metrics
        user.total_xp = 0
        user.level = 1
        user.current_streak = 0
        user.best_streak = 0
        user.last_active_date = None

        # 2. Reset task instances
        db.query(TaskInstance).filter(TaskInstance.user_id == target_user_id).update({
            TaskInstance.status: "PENDING",
            TaskInstance.xp_awarded: 0,
            TaskInstance.completed_at: None,
            TaskInstance.actual_duration: 0,
            TaskInstance.timer_seconds: 0,
            TaskInstance.is_timer_running: False
        }, synchronize_session=False)

        # 3. Reset user skills XP and level
        db.query(UserSkill).filter(UserSkill.user_id == target_user_id).update({
            UserSkill.xp: 0,
            UserSkill.level: 1
        }, synchronize_session=False)

        # 4. Clear daily stats, rest days, and achievements
        db.query(DailyStat).filter(DailyStat.user_id == target_user_id).delete(synchronize_session=False)
        db.query(RestDay).filter(RestDay.user_id == target_user_id).delete(synchronize_session=False)
        db.query(UserAchievement).filter(UserAchievement.user_id == target_user_id).delete(synchronize_session=False)

        db.commit()
        db.refresh(user)
        return user
