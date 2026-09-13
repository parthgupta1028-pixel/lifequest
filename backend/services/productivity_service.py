import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from models.task_instance import TaskInstance
from models.task import Task
from models.daily_stat import DailyStat, RestDay

class ProductivityService:
    PRIORITY_WEIGHTS = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "URGENT": 4
    }

    @staticmethod
    def calculate_daily_score(
        db: Session, 
        user_id: int, 
        target_date: datetime.date
    ) -> Dict[str, Any]:
        """
        Calculates understandable daily productivity score (0 - 100%):
        - 60% Completion Rate (ratio of scheduled tasks completed)
        - 25% Priority Weight (rewards completing harder/higher priority tasks)
        - 15% Time Efficiency (planned vs actual adherence)
        """
        # Check rest day
        is_rest = (
            db.query(RestDay)
            .filter(RestDay.user_id == user_id, RestDay.rest_date == target_date)
            .first()
            is not None
        )

        instances = (
            db.query(TaskInstance)
            .join(Task, TaskInstance.task_id == Task.id)
            .filter(TaskInstance.user_id == user_id, TaskInstance.occurrence_date == target_date)
            .all()
        )

        total_tasks = len(instances)
        if total_tasks == 0:
            score = 100 if is_rest else 0
            explanation = "Rest day logged - rest well!" if is_rest else "No tasks scheduled yet today."
            # Save or update DailyStat
            ProductivityService._save_stat(db, user_id, target_date, 0, 0, 0, 0, score, is_rest)
            return {
                "total_score": score,
                "tasks_completed": 0,
                "tasks_total": 0,
                "completion_rate": 1.0 if is_rest else 0.0,
                "xp_earned_today": 0,
                "productive_time_minutes": 0,
                "is_rest_day": is_rest,
                "explanation": explanation,
            }

        completed_instances = [inst for inst in instances if inst.status == "COMPLETED"]
        completed_count = len(completed_instances)
        completion_rate = completed_count / total_tasks

        # 1. Completion Rate component (60 points max)
        completion_points = 60.0 * completion_rate

        # 2. Priority component (25 points max)
        total_possible_weight = sum(
            ProductivityService.PRIORITY_WEIGHTS.get(inst.task.priority, 2) 
            for inst in instances
        )
        earned_weight = sum(
            ProductivityService.PRIORITY_WEIGHTS.get(inst.task.priority, 2) 
            for inst in completed_instances
        )
        priority_rate = (earned_weight / total_possible_weight) if total_possible_weight > 0 else 0
        priority_points = 25.0 * priority_rate

        # 3. Time efficiency component (15 points max)
        # Give points if actual time was spent on completed tasks without extreme delays
        time_efficiency_points = 0.0
        total_actual_minutes = sum(inst.actual_duration for inst in instances)
        total_xp_today = sum(inst.xp_awarded for inst in completed_instances)

        if completed_count > 0:
            efficient_tasks = 0
            for inst in completed_instances:
                planned = inst.planned_duration or 30
                actual = inst.actual_duration
                # If actual is logged and within 150% of planned, give credit
                if actual > 0 and actual <= (planned * 1.5):
                    efficient_tasks += 1
                elif actual == 0:
                    # Timer wasn't used but completed
                    efficient_tasks += 0.8
            time_efficiency_points = 15.0 * (efficient_tasks / completed_count)

        total_score = int(round(min(100.0, completion_points + priority_points + time_efficiency_points)))

        explanation = (
            f"Completed {completed_count}/{total_tasks} tasks ({int(completion_rate * 100)}%), "
            f"cleared {int(priority_rate * 100)}% of priority weight, and logged {total_actual_minutes}m productive time."
        )

        ProductivityService._save_stat(
            db, user_id, target_date, completed_count, total_tasks, 
            total_xp_today, total_actual_minutes, total_score, is_rest
        )

        return {
            "total_score": total_score,
            "tasks_completed": completed_count,
            "tasks_total": total_tasks,
            "completion_rate": round(completion_rate, 2),
            "xp_earned_today": total_xp_today,
            "productive_time_minutes": total_actual_minutes,
            "is_rest_day": is_rest,
            "explanation": explanation,
        }

    @staticmethod
    def _save_stat(
        db: Session, 
        user_id: int, 
        target_date: datetime.date,
        completed: int, 
        total: int, 
        xp: int, 
        minutes: int, 
        score: int, 
        is_rest: bool
    ):
        stat = (
            db.query(DailyStat)
            .filter(DailyStat.user_id == user_id, DailyStat.stat_date == target_date)
            .first()
        )
        if not stat:
            stat = DailyStat(
                user_id=user_id,
                stat_date=target_date,
                tasks_completed=completed,
                tasks_total=total,
                xp_earned=xp,
                productive_time_minutes=minutes,
                productivity_score=score,
                is_rest_day=is_rest,
            )
            db.add(stat)
        else:
            stat.tasks_completed = completed
            stat.tasks_total = total
            stat.xp_earned = xp
            stat.productive_time_minutes = minutes
            stat.productivity_score = score
            stat.is_rest_day = is_rest
        db.commit()
