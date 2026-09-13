import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CategoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    icon: str
    color: str
    is_system: bool

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str = "folder"
    color: str = "#3B82F6"

class SkillResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: str
    color: str

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[int] = None
    skill_id: Optional[int] = None
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, URGENT
    estimated_duration: int = Field(30, ge=1, le=1440)  # minutes
    recurrence: str = "DAILY"  # ONCE, DAILY, WEEKLY, CUSTOM
    recurrence_days: Optional[str] = None  # e.g. "0,1,2,3,4" (Mon-Fri)
    start_date: Optional[datetime.date] = None
    due_date: Optional[datetime.date] = None
    due_time: Optional[str] = None
    xp_reward: int = Field(30, ge=5, le=500)
    is_active: bool = True

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    skill_id: Optional[int] = None
    priority: Optional[str] = None
    estimated_duration: Optional[int] = None
    recurrence: Optional[str] = None
    recurrence_days: Optional[str] = None
    due_date: Optional[datetime.date] = None
    due_time: Optional[str] = None
    xp_reward: Optional[int] = None
    is_active: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    is_archived: bool
    created_at: datetime.datetime
    category: Optional[CategoryResponse] = None
    skill: Optional[SkillResponse] = None

    class Config:
        from_attributes = True

class TaskInstanceResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    occurrence_date: datetime.date
    status: str
    planned_duration: int
    actual_duration: int
    xp_awarded: int
    completed_at: Optional[datetime.datetime] = None
    timer_seconds: int
    is_timer_running: bool
    notes: Optional[str] = None
    task: TaskResponse

    class Config:
        from_attributes = True

class TaskInstanceUpdate(BaseModel):
    status: Optional[str] = None
    actual_duration: Optional[int] = None
    notes: Optional[str] = None

class TaskCompleteResponse(BaseModel):
    instance: TaskInstanceResponse
    xp_earned: int
    new_total_xp: int
    previous_level: int
    new_level: int
    did_level_up: bool
    skill_name: Optional[str] = None
    skill_xp_earned: int = 0
    skill_new_level: int = 1
    did_skill_level_up: bool = False
    current_streak: int
    unlocked_achievements: List[dict] = []
    productivity_score: int
