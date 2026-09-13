import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class DailyMission(Base):
    __tablename__ = "daily_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_date = Column(Date, nullable=False, index=True)
    
    title = Column(String(150), default="Daily Productivity Quest")
    description = Column(String(255), nullable=True)
    xp_reward = Column(Integer, default=100)
    is_completed = Column(Boolean, default=False)
    is_claimed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # JSON encoded list of sub-tasks/goals:
    # [{"id": 1, "task_id": 4, "text": "Complete 1 hour of Coding", "target": 60, "current": 30, "completed": false}]
    items_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "mission_date", name="uq_user_daily_mission"),)

    user = relationship("User", back_populates="missions")


class TimerLog(Base):
    __tablename__ = "timer_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_instance_id = Column(Integer, ForeignKey("task_instances.id", ondelete="CASCADE"), nullable=False, index=True)
    
    start_time = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    
    task_instance = relationship("TaskInstance", back_populates="timer_logs")
