import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.daily_mission import DailyMission
from models.task_instance import TaskInstance
from models.task import Task
from models.skill import Skill
from models.user import User
from services.xp_service import XPService

class MissionService:
    @staticmethod
    def get_or_create_daily_mission(db: Session, user: User, target_date: datetime.date) -> DailyMission:
        """Retrieves or dynamically generates today's daily mission based on user tasks."""
        mission = (
            db.query(DailyMission)
            .filter(DailyMission.user_id == user.id, DailyMission.mission_date == target_date)
            .first()
        )
        if mission:
            # Sync mission progress with current state
            MissionService._sync_mission_progress(db, user.id, mission, target_date)
            return mission

        # Generate new daily mission based on scheduled tasks
        instances = (
            db.query(TaskInstance)
            .join(Task, TaskInstance.task_id == Task.id)
            .filter(TaskInstance.user_id == user.id, TaskInstance.occurrence_date == target_date)
            .all()
        )

        items = []
        item_id = 1

        # Check for Coding or Study tasks
        coding_tasks = [inst for inst in instances if inst.task.skill and inst.task.skill.name == "Coding"]
        study_tasks = [inst for inst in instances if inst.task.skill and inst.task.skill.name == "Study"]
        fitness_tasks = [inst for inst in instances if inst.task.skill and inst.task.skill.name == "Fitness"]

        if coding_tasks:
            items.append({
                "id": item_id,
                "text": f"Complete {coding_tasks[0].task.title}",
                "type": "specific_task",
                "task_id": coding_tasks[0].task.id,
                "target": 1,
                "current": 1 if coding_tasks[0].status == "COMPLETED" else 0,
                "completed": coding_tasks[0].status == "COMPLETED",
            })
            item_id += 1
        elif study_tasks:
            items.append({
                "id": item_id,
                "text": f"Complete study session: {study_tasks[0].task.title}",
                "type": "specific_task",
                "task_id": study_tasks[0].task.id,
                "target": 1,
                "current": 1 if study_tasks[0].status == "COMPLETED" else 0,
                "completed": study_tasks[0].status == "COMPLETED",
            })
            item_id += 1

        if fitness_tasks and len(items) < 2:
            items.append({
                "id": item_id,
                "text": f"Complete workout: {fitness_tasks[0].task.title}",
                "type": "specific_task",
                "task_id": fitness_tasks[0].task.id,
                "target": 1,
                "current": 1 if fitness_tasks[0].status == "COMPLETED" else 0,
                "completed": fitness_tasks[0].status == "COMPLETED",
            })
            item_id += 1

        # Goal for total tasks completed today
        total_scheduled = len(instances)
        target_tasks = max(1, min(3, total_scheduled))
        items.append({
            "id": item_id,
            "text": f"Complete at least {target_tasks} task{'s' if target_tasks > 1 else ''} today",
            "type": "tasks_count",
            "target": target_tasks,
            "current": 0,
            "completed": False,
        })
        item_id += 1

        # Goal for productive time
        items.append({
            "id": item_id,
            "text": "Log 30+ minutes of focused productive time",
            "type": "minutes_count",
            "target": 30,
            "current": 0,
            "completed": False,
        })

        new_mission = DailyMission(
            user_id=user.id,
            mission_date=target_date,
            title="Today's Productivity Expedition",
            description="Clear daily objectives to claim your bonus XP bounty!",
            xp_reward=100,
            is_completed=False,
            is_claimed=False,
            items_json=json.dumps(items),
        )
        db.add(new_mission)
        db.commit()
        db.refresh(new_mission)

        MissionService._sync_mission_progress(db, user.id, new_mission, target_date)
        return new_mission

    @staticmethod
    def _sync_mission_progress(db: Session, user_id: int, mission: DailyMission, target_date: datetime.date):
        """Updates objective counters from current instances."""
        try:
            items = json.loads(mission.items_json)
        except Exception:
            return

        instances = (
            db.query(TaskInstance)
            .join(Task, TaskInstance.task_id == Task.id)
            .filter(TaskInstance.user_id == user_id, TaskInstance.occurrence_date == target_date)
            .all()
        )

        completed_count = sum(1 for inst in instances if inst.status == "COMPLETED")
        total_minutes = sum(inst.actual_duration for inst in instances)
        completed_task_ids = {inst.task_id for inst in instances if inst.status == "COMPLETED"}

        all_done = True
        for item in items:
            item_type = item.get("type")
            if item_type == "specific_task":
                task_id = item.get("task_id")
                if task_id in completed_task_ids:
                    item["current"] = 1
                    item["completed"] = True
                else:
                    item["current"] = 0
                    item["completed"] = False
            elif item_type == "tasks_count":
                target = item.get("target", 1)
                item["current"] = completed_count
                item["completed"] = completed_count >= target
            elif item_type == "minutes_count":
                target = item.get("target", 30)
                item["current"] = total_minutes
                item["completed"] = total_minutes >= target

            if not item.get("completed", False):
                all_done = False

        mission.items_json = json.dumps(items)
        if all_done and not mission.is_completed:
            mission.is_completed = True
            mission.completed_at = datetime.datetime.utcnow()

        db.commit()

    @staticmethod
    def claim_mission_reward(db: Session, user: User, target_date: datetime.date) -> Dict[str, Any]:
        mission = (
            db.query(DailyMission)
            .filter(DailyMission.user_id == user.id, DailyMission.mission_date == target_date)
            .first()
        )
        if not mission:
            return {"success": False, "message": "No mission found for today"}

        MissionService._sync_mission_progress(db, user.id, mission, target_date)

        if not mission.is_completed:
            return {"success": False, "message": "Mission objectives are not all completed yet"}

        if mission.is_claimed:
            return {"success": False, "message": "Mission reward already claimed today"}

        mission.is_claimed = True
        # Award mission XP
        user.total_xp, old_lvl, new_lvl, did_level_up = XPService.award_xp(user.total_xp, mission.xp_reward)
        user.level = new_lvl
        db.commit()

        return {
            "success": True,
            "xp_awarded": mission.xp_reward,
            "new_total_xp": user.total_xp,
            "level": new_lvl,
            "did_level_up": did_level_up,
            "message": f"Claimed +{mission.xp_reward} Mission XP Bounty!"
        }
