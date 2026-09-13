import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class TaskInstance(Base):
    __tablename__ = "task_instances"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    occurrence_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), default="PENDING")  # PENDING, COMPLETED, PAUSED, OVERDUE, SKIPPED
    
    planned_duration = Column(Integer, default=30)  # in minutes
    actual_duration = Column(Integer, default=0)    # in minutes
    
    # Immutable historical record of XP awarded for this specific instance
    xp_awarded = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    
    # Stopwatch / Timer tracking
    timer_seconds = Column(Integer, default=0)
    is_timer_running = Column(Boolean, default=False)
    timer_started_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("task_id", "occurrence_date", name="uq_task_occurrence"),)

    user = relationship("User", back_populates="task_instances")
    task = relationship("Task", back_populates="instances")
    timer_logs = relationship("TimerLog", back_populates="task_instance", cascade="all, delete-orphan")
