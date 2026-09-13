import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_tasks: int
    completed_tasks: int
    total_xp_generated: int
    total_productive_hours: float
    total_skills_created: int

class AdminUserItem(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    level: int
    total_xp: int
    current_streak: int
    best_streak: int
    tasks_count: int
    completed_tasks_count: int
    created_at: datetime.datetime

class AdminUsersResponse(BaseModel):
    total: int
    users: List[AdminUserItem]

class RoleUpdateRequest(BaseModel):
    role: str = Field(..., pattern="^(admin|user)$")
