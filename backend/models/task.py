import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, URGENT
    estimated_duration = Column(Integer, default=30)  # minutes
    
    # Recurrence & Scheduling
    recurrence = Column(String(20), default="ONCE")  # ONCE, DAILY, WEEKLY, CUSTOM
    recurrence_days = Column(String(50), nullable=True)  # e.g. "0,1,2,3,4" for Mon-Fri
    start_date = Column(Date, default=datetime.date.today)
    due_date = Column(Date, nullable=True)
    due_time = Column(String(10), nullable=True)  # e.g. "18:00"
    
    xp_reward = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)  # True = Active, False = Paused
    is_archived = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    skill = relationship("Skill", back_populates="tasks")
    instances = relationship("TaskInstance", back_populates="task", cascade="all, delete-orphan")
