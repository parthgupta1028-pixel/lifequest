import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.task_instance import TaskInstance
from models.task import Task
from models.daily_mission import TimerLog
from schemas.gamification import TimerStateResponse
from auth.jwt import get_current_user
from services.productivity_service import ProductivityService

router = APIRouter(prefix="/timers", tags=["Timers"])

@router.get("/{instance_id}/status", response_model=TimerStateResponse)
def get_timer_status(
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

    # If currently running, compute live elapsed seconds
    total_seconds = instance.timer_seconds
    if instance.is_timer_running and instance.timer_started_at:
        delta = (datetime.datetime.utcnow() - instance.timer_started_at).total_seconds()
        total_seconds += int(delta)

    actual_minutes = total_seconds // 60
    diff_minutes = actual_minutes - instance.planned_duration

    return {
        "task_instance_id": instance.id,
        "task_title": instance.task.title,
        "timer_seconds": total_seconds,
        "is_timer_running": instance.is_timer_running,
        "planned_duration": instance.planned_duration,
        "actual_duration": actual_minutes,
        "difference_minutes": diff_minutes,
        "start_time": instance.timer_started_at,
    }

@router.post("/{instance_id}/start", response_model=TimerStateResponse)
def start_timer(
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

    if not instance.is_timer_running:
        now = datetime.datetime.utcnow()
        instance.is_timer_running = True
        instance.timer_started_at = now
        
        # Create a timer log record
        log = TimerLog(
            user_id=current_user.id,
            task_instance_id=instance.id,
            start_time=now,
        )
        db.add(log)
        db.commit()

    return get_timer_status(instance_id, db, current_user)

@router.post("/{instance_id}/pause", response_model=TimerStateResponse)
def pause_timer(
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

    if instance.is_timer_running and instance.timer_started_at:
        now = datetime.datetime.utcnow()
        elapsed_now = int((now - instance.timer_started_at).total_seconds())
        instance.timer_seconds += max(0, elapsed_now)
        instance.is_timer_running = False
        instance.timer_started_at = None

        # Close active timer log
        log = (
            db.query(TimerLog)
            .filter(TimerLog.task_instance_id == instance.id, TimerLog.end_time.is_(None))
            .order_by(TimerLog.id.desc())
            .first()
        )
        if log:
            log.end_time = now
            log.duration_seconds = elapsed_now

        # Save actual duration minutes in database
        instance.actual_duration = instance.timer_seconds // 60
        db.commit()

    return get_timer_status(instance_id, db, current_user)

@router.post("/{instance_id}/stop", response_model=TimerStateResponse)
def stop_timer(
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

    now = datetime.datetime.utcnow()
    if instance.is_timer_running and instance.timer_started_at:
        elapsed_now = int((now - instance.timer_started_at).total_seconds())
        instance.timer_seconds += max(0, elapsed_now)

        log = (
            db.query(TimerLog)
            .filter(TimerLog.task_instance_id == instance.id, TimerLog.end_time.is_(None))
            .order_by(TimerLog.id.desc())
            .first()
        )
        if log:
            log.end_time = now
            log.duration_seconds = elapsed_now

    instance.is_timer_running = False
    instance.timer_started_at = None
    # Save final actual minutes to database
    instance.actual_duration = max(1, instance.timer_seconds // 60) if instance.timer_seconds >= 60 else (1 if instance.timer_seconds > 0 else 0)
    db.commit()

    # Refresh score with actual time
    ProductivityService.calculate_daily_score(db, current_user.id, instance.occurrence_date)

    return get_timer_status(instance_id, db, current_user)
