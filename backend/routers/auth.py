from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.auth import UserRegister, UserLogin, Token, UserResponse
from auth.security import hash_password, verify_password
from auth.jwt import create_access_token, get_current_user
from services.skill_service import SkillService
from services.task_service import TaskService
from services.achievement_service import AchievementService
from services.xp_service import XPService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Check duplicate
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        level=1,
        total_xp=0,
        current_streak=0,
        best_streak=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize seeds
    SkillService.ensure_default_skills(db)
    SkillService.ensure_user_skills(db, user.id)
    TaskService.ensure_default_categories(db)
    AchievementService.ensure_default_achievements(db)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter((User.username == data.username_or_email) | (User.email == data.username_or_email))
        .first()
    )
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated by an administrator."
        )

    # Ensure skills exist for this user
    SkillService.ensure_default_skills(db)
    SkillService.ensure_user_skills(db, user.id)
    TaskService.ensure_default_categories(db)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    prog = XPService.get_level_progress(current_user.total_xp)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role or "user",
        "is_active": current_user.is_active,
        "level": current_user.level,
        "total_xp": current_user.total_xp,
        "current_streak": current_user.current_streak,
        "best_streak": current_user.best_streak,
        "avatar": current_user.avatar,
        "last_active_date": current_user.last_active_date,
        "created_at": current_user.created_at,
        "level_progress": prog
    }

@router.post("/reset-my-progress")
def reset_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allows any logged-in user to reset their own progress (XP, level, streaks, tasks) back to 0."""
    from services.admin_service import AdminService
    user = AdminService.reset_user_progress(db, target_user_id=current_user.id)
    return {
        "success": True,
        "message": "Your progress has been completely reset to Level 1 with 0 XP.",
        "level": user.level,
        "total_xp": user.total_xp,
        "current_streak": user.current_streak
    }
