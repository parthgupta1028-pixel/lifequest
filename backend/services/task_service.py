import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from models.task import Task
from models.task_instance import TaskInstance
from models.category import Category
from schemas.task import TaskCreate, TaskUpdate

DEFAULT_CATEGORIES = [
    {"name": "Coding", "icon": "code", "color": "#3B82F6"},
    {"name": "College", "icon": "graduation-cap", "color": "#8B5CF6"},
    {"name": "Study", "icon": "book-open", "color": "#6366F1"},
    {"name": "Fitness", "icon": "dumbbell", "color": "#EF4444"},
    {"name": "Personal", "icon": "user", "color": "#EC4899"},
    {"name": "Home", "icon": "home", "color": "#F59E0B"},
    {"name": "Learning", "icon": "lightbulb", "color": "#10B981"},
]

class TaskService:
    @staticmethod
    def ensure_default_categories(db: Session):
        """Seed default system categories if not present."""
        for cat in DEFAULT_CATEGORIES:
            existing = db.query(Category).filter(Category.name == cat["name"], Category.user_id.is_(None)).first()
            if not existing:
                db.add(Category(
                    name=cat["name"],
                    icon=cat["icon"],
                    color=cat["color"],
                    is_system=True,
                    user_id=None
                ))
        db.commit()

    @staticmethod
    def is_task_scheduled_for_date(task: Task, target_date: datetime.date) -> bool:
        """Determines if a recurring or one-time task falls on target_date."""
        if not task.is_active or task.is_archived:
            return False

        if task.start_date and target_date < task.start_date:
            return False

        if task.due_date and task.recurrence == "ONCE":
            return task.due_date == target_date

        if task.recurrence == "ONCE":
            # If no explicit due date, defaults to its start date
            return task.start_date == target_date

        if task.recurrence == "DAILY":
            return True

        weekday = target_date.weekday()  # Monday is 0, Sunday is 6

        if task.recurrence == "WEEKLY":
            # If recurrence_days specified, match against it, else weekly on the task's start_date day-of-week
            if task.recurrence_days:
                allowed_days = [int(d.strip()) for d in task.recurrence_days.split(",") if d.strip().isdigit()]
                return weekday in allowed_days
            return weekday == (task.start_date.weekday() if task.start_date else 0)

        if task.recurrence == "CUSTOM":
            if task.recurrence_days:
                allowed_days = [int(d.strip()) for d in task.recurrence_days.split(",") if d.strip().isdigit()]
                return weekday in allowed_days
            return False

        return False

    @staticmethod
    def sync_instances_for_date(db: Session, user_id: int, target_date: datetime.date) -> List[TaskInstance]:
        """
        Ensures all eligible active recurring tasks have a TaskInstance generated for target_date.
        Never duplicates existing instances or touches completed ones.
        """
        active_tasks = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.is_active == True, Task.is_archived == False)
            .all()
        )

        for task in active_tasks:
            if TaskService.is_task_scheduled_for_date(task, target_date):
                # Check if instance already exists
                existing = (
                    db.query(TaskInstance)
                    .filter(
                        TaskInstance.task_id == task.id,
                        TaskInstance.occurrence_date == target_date
                    )
                    .first()
                )
                if not existing:
                    instance = TaskInstance(
                        task_id=task.id,
                        user_id=user_id,
                        occurrence_date=target_date,
                        status="PENDING",
                        planned_duration=task.estimated_duration,
                        actual_duration=0,
                        xp_awarded=0,
                    )
                    db.add(instance)
        db.commit()

        # Return all instances for target date
        return (
            db.query(TaskInstance)
            .join(Task, TaskInstance.task_id == Task.id)
            .filter(TaskInstance.user_id == user_id, TaskInstance.occurrence_date == target_date)
            .order_by(
                # Order by priority: URGENT, HIGH, MEDIUM, LOW
                Task.priority.desc(),
                TaskInstance.status.asc(),
                TaskInstance.id.asc()
            )
            .all()
        )

    @staticmethod
    def create_task(db: Session, user_id: int, data: TaskCreate) -> Task:
        """Creates a permanent task and automatically seeds instance for today or start_date."""
        task_dict = data.model_dump()
        if not task_dict.get("start_date"):
            task_dict["start_date"] = datetime.date.today()
        
        task = Task(user_id=user_id, **task_dict)
        db.add(task)
        db.commit()
        db.refresh(task)

        # Generate instance for today if scheduled
        today = datetime.date.today()
        target_date = task.start_date if task.start_date >= today else today
        if TaskService.is_task_scheduled_for_date(task, target_date):
            instance = TaskInstance(
                task_id=task.id,
                user_id=user_id,
                occurrence_date=target_date,
                status="PENDING",
                planned_duration=task.estimated_duration,
                actual_duration=0,
                xp_awarded=0,
            )
            db.add(instance)
            db.commit()

        return task

    @staticmethod
    def update_task(db: Session, user_id: int, task_id: int, data: TaskUpdate) -> Optional[Task]:
        """
        Updates task configuration.
        Crucial Rule: Historical completed instances are NEVER modified or recalculated!
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)

        # Update planned duration on today's PENDING instance if not yet completed
        today = datetime.date.today()
        today_instance = (
            db.query(TaskInstance)
            .filter(
                TaskInstance.task_id == task.id,
                TaskInstance.occurrence_date == today,
                TaskInstance.status == "PENDING"
            )
            .first()
        )
        if today_instance and "estimated_duration" in update_data:
            today_instance.planned_duration = task.estimated_duration
            db.commit()

        return task

    @staticmethod
    def pause_task(db: Session, user_id: int, task_id: int) -> Optional[Task]:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            return None
        task.is_active = False
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def resume_task(db: Session, user_id: int, task_id: int) -> Optional[Task]:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            return None
        task.is_active = True
        db.commit()
        db.refresh(task)
        # Sync today
        TaskService.sync_instances_for_date(db, user_id, datetime.date.today())
        return task

    @staticmethod
    def delete_task(db: Session, user_id: int, task_id: int) -> bool:
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            return False
        # Soft delete / archive to keep historical occurrences intact
        task.is_archived = True
        task.is_active = False
        db.commit()
        return True
