from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.category import Category
from schemas.task import CategoryCreate, CategoryResponse
from auth.jwt import get_current_user
from services.task_service import TaskService

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    TaskService.ensure_default_categories(db)
    categories = (
        db.query(Category)
        .filter((Category.user_id.is_(None)) | (Category.user_id == current_user.id))
        .order_by(Category.is_system.desc(), Category.name.asc())
        .all()
    )
    return categories

@router.post("", response_model=CategoryResponse)
def create_custom_category(
    data: CategoryCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    cat = Category(
        user_id=current_user.id,
        name=data.name,
        icon=data.icon,
        color=data.color,
        is_system=False,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
