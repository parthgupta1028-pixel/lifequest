import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class SkillCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    icon: Optional[str] = "zap"
    color: Optional[str] = "#10B981"

class SkillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class UserSkillResponse(BaseModel):
    id: int
    skill_id: int
    name: str
    description: Optional[str] = ""
    icon: str
    color: str
    is_active: bool = True
    xp: int
    level: int
    current_level_xp: int
    next_level_xp: int
    progress_percentage: float

class HexagonRadarData(BaseModel):
    skill: str
    skill_id: Optional[int] = None
    level: int
    xp: int
    color: Optional[str] = None
    icon: Optional[str] = None
    progress_percentage: Optional[float] = None
    value: Optional[float] = None
    full_mark: int = 100

class AchievementResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    category: str
    xp_bonus: int
    requirement_type: str
    requirement_value: int
    is_unlocked: bool = False
    unlocked_at: Optional[datetime.datetime] = None

class MissionItem(BaseModel):
    id: int
    task_id: Optional[int] = None
    text: str
    target: int = 1
    current: int = 0
    completed: bool = False

class DailyMissionResponse(BaseModel):
    id: int
    mission_date: datetime.date
    title: str
    description: Optional[str] = None
    xp_reward: int
    is_completed: bool
    is_claimed: bool
    completed_at: Optional[datetime.datetime] = None
    items: List[MissionItem]

class RestDayCreate(BaseModel):
    rest_date: datetime.date
    note: Optional[str] = "Rest & Recovery"

class RestDayResponse(BaseModel):
    id: int
    rest_date: datetime.date
    note: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class HeatmapDay(BaseModel):
    date: str
    xp: int
    tasks_completed: int
    productive_time: int
    productivity_score: int
    is_rest_day: bool
    level: int  # 0 to 4 intensity for GitHub style coloring

class ProductivityScoreBreakdown(BaseModel):
    total_score: int
    completion_rate: float
    tasks_completed: int
    tasks_total: int
    high_priority_completed: int
    time_efficiency_ratio: float
    explanation: str

class TimerStateResponse(BaseModel):
    task_instance_id: int
    task_title: str
    timer_seconds: int
    is_timer_running: bool
    planned_duration: int
    actual_duration: int
    difference_minutes: int
    start_time: Optional[datetime.datetime] = None
