import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stat_date = Column(Date, nullable=False, index=True)
    
    tasks_completed = Column(Integer, default=0)
    tasks_total = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    productive_time_minutes = Column(Integer, default=0)
    productivity_score = Column(Integer, default=0)  # 0 to 100 percentage
    is_rest_day = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "stat_date", name="uq_user_daily_stat"),)

    user = relationship("User", back_populates="daily_stats")


class RestDay(Base):
    __tablename__ = "rest_days"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rest_date = Column(Date, nullable=False, index=True)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "rest_date", name="uq_user_rest_date"),)

    user = relationship("User", back_populates="rest_days")
