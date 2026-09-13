from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from auth.jwt import require_admin
from schemas.admin import AdminStatsResponse, AdminUsersResponse, RoleUpdateRequest
from services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Returns system-wide aggregated telemetry and statistics."""
    return AdminService.get_system_stats(db)

@router.get("/users", response_model=AdminUsersResponse)
def get_admin_users(
    search: Optional[str] = Query(None, description="Search by username or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Returns paginated and searchable users list with telemetry."""
    return AdminService.get_users_list(db, search=search, page=page, limit=limit)

@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Toggles account active state (activate/deactivate)."""
    try:
        user = AdminService.toggle_user_active(db, target_user_id=user_id, admin_id=admin.id)
        return {
            "success": True,
            "user_id": user.id,
            "username": user.username,
            "is_active": user.is_active,
            "message": f"User '{user.username}' is now {'active' if user.is_active else 'deactivated'}."
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    data: RoleUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Promotes or demotes user role ('admin' or 'user')."""
    try:
        user = AdminService.update_user_role(
            db, 
            target_user_id=user_id, 
            new_role=data.role, 
            admin_id=admin.id
        )
        return {
            "success": True,
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "message": f"User '{user.username}' role updated to '{user.role}'."
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
