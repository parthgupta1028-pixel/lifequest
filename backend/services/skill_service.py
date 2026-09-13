from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from models.skill import Skill, UserSkill
from models.task import Task
from models.user import User
from services.xp_service import XPService

CORE_SKILLS = [
    {"name": "Coding", "description": "Programming, software development, algorithms, and technical engineering.", "icon": "code", "color": "#3B82F6"},
    {"name": "Study", "description": "Academic coursework, exams, reading textbooks, and formal education.", "icon": "book-open", "color": "#8B5CF6"},
    {"name": "Fitness", "description": "Physical workouts, exercise, health, cardio, and bodily wellness.", "icon": "activity", "color": "#EF4444"},
    {"name": "Focus", "description": "Deep work, distraction-free concentration, and Pomodoro sessions.", "icon": "target", "color": "#F59E0B"},
    {"name": "Learning", "description": "Online courses, self-directed research, podcasts, and skill acquisition.", "icon": "compass", "color": "#10B981"},
    {"name": "Time Management", "description": "Planning, habit tracking, punctuality, and productivity execution.", "icon": "clock", "color": "#EC4899"},
]

class SkillService:
    @staticmethod
    def ensure_default_skills(db: Session):
        """Seeds global template skills if none exist."""
        pass

    @staticmethod
    def ensure_user_skills(db: Session, user_id: int):
        """Ensures the user has their custom skills initialized."""
        user_skills_count = db.query(Skill).filter(Skill.user_id == user_id).count()
        if user_skills_count == 0:
            # Seed the 6 default starter skills for this user
            for skill_def in CORE_SKILLS:
                new_skill = Skill(
                    user_id=user_id,
                    name=skill_def["name"],
                    description=skill_def["description"],
                    icon=skill_def["icon"],
                    color=skill_def["color"],
                    is_active=True,
                )
                db.add(new_skill)
                db.flush()

                user_skill = UserSkill(
                    user_id=user_id,
                    skill_id=new_skill.id,
                    xp=0,
                    level=1
                )
                db.add(user_skill)
            db.commit()
        else:
            # Make sure all user's skills have an entry in UserSkill
            skills = db.query(Skill).filter(Skill.user_id == user_id).all()
            for s in skills:
                us = db.query(UserSkill).filter(UserSkill.user_id == user_id, UserSkill.skill_id == s.id).first()
                if not us:
                    new_us = UserSkill(user_id=user_id, skill_id=s.id, xp=0, level=1)
                    db.add(new_us)
            db.commit()

    @staticmethod
    def create_user_skill(
        db: Session, 
        user_id: int, 
        name: str, 
        description: str = "", 
        icon: str = "zap", 
        color: str = "#10B981"
    ) -> Dict[str, any]:
        """Creates a new customizable skill for the user."""
        SkillService.ensure_user_skills(db, user_id)
        
        skill = Skill(
            user_id=user_id,
            name=name.strip(),
            description=description.strip() if description else "",
            icon=icon,
            color=color,
            is_active=True
        )
        db.add(skill)
        db.flush()

        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill.id,
            xp=0,
            level=1
        )
        db.add(user_skill)
        db.commit()
        db.refresh(skill)

        prog = XPService.get_level_progress(0)
        return {
            "id": user_skill.id,
            "skill_id": skill.id,
            "name": skill.name,
            "description": skill.description,
            "icon": skill.icon,
            "color": skill.color,
            "is_active": skill.is_active,
            "xp": 0,
            "level": 1,
            "current_level_xp": 0,
            "next_level_xp": prog["next_level_xp"],
            "progress_percentage": 0,
        }

    @staticmethod
    def update_user_skill(
        db: Session,
        user_id: int,
        skill_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        icon: Optional[str] = None,
        color: Optional[str] = None,
    ) -> Optional[Dict[str, any]]:
        """Updates a user's skill details."""
        skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user_id).first()
        if not skill:
            return None

        if name is not None and name.strip():
            skill.name = name.strip()
        if description is not None:
            skill.description = description.strip()
        if icon is not None and icon.strip():
            skill.icon = icon.strip()
        if color is not None and color.strip():
            skill.color = color.strip()

        db.commit()
        db.refresh(skill)

        us = db.query(UserSkill).filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill.id).first()
        xp = us.xp if us else 0
        level = us.level if us else 1
        prog = XPService.get_level_progress(xp)

        return {
            "id": us.id if us else skill.id,
            "skill_id": skill.id,
            "name": skill.name,
            "description": skill.description,
            "icon": skill.icon,
            "color": skill.color,
            "is_active": skill.is_active,
            "xp": xp,
            "level": level,
            "current_level_xp": prog["xp_into_level"],
            "next_level_xp": prog["next_level_xp"],
            "progress_percentage": prog["progress_percentage"],
        }

    @staticmethod
    def toggle_user_skill(db: Session, user_id: int, skill_id: int) -> Optional[Dict[str, any]]:
        """Toggles a skill's active status."""
        skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user_id).first()
        if not skill:
            return None

        skill.is_active = not skill.is_active
        db.commit()
        db.refresh(skill)

        us = db.query(UserSkill).filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill.id).first()
        xp = us.xp if us else 0
        level = us.level if us else 1
        prog = XPService.get_level_progress(xp)

        return {
            "id": us.id if us else skill.id,
            "skill_id": skill.id,
            "name": skill.name,
            "description": skill.description,
            "icon": skill.icon,
            "color": skill.color,
            "is_active": skill.is_active,
            "xp": xp,
            "level": level,
            "current_level_xp": prog["xp_into_level"],
            "next_level_xp": prog["next_level_xp"],
            "progress_percentage": prog["progress_percentage"],
        }

    @staticmethod
    def delete_user_skill(db: Session, user_id: int, skill_id: int) -> bool:
        """
        Deletes a user's custom skill.
        Existing tasks pointing to this skill will have skill_id set to None.
        Completed task instances and historical XP are permanently preserved!
        """
        skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user_id).first()
        if not skill:
            return False

        # Set task.skill_id to None for any task referencing this skill
        db.query(Task).filter(Task.skill_id == skill_id).update({Task.skill_id: None})

        # Delete skill (and cascade deletes user_skills)
        db.delete(skill)
        db.commit()
        return True

    @staticmethod
    def add_skill_xp(db: Session, user_id: int, skill_id: int, xp: int) -> Tuple[str, int, int, bool]:
        """
        Adds XP to a user's skill.
        Returns: (skill_name, new_skill_xp, new_skill_level, did_skill_level_up)
        """
        if not skill_id or xp <= 0:
            return "", 0, 1, False

        SkillService.ensure_user_skills(db, user_id)
        user_skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id)
            .first()
        )
        if not user_skill:
            return "", 0, 1, False

        old_level = user_skill.level
        user_skill.xp += xp
        new_level = XPService.calculate_level_from_xp(user_skill.xp)
        user_skill.level = new_level
        db.commit()

        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        skill_name = skill.name if skill else "Skill"
        did_level_up = new_level > old_level

        return skill_name, user_skill.xp, new_level, did_level_up

    @staticmethod
    def get_radar_data(db: Session, user_id: int) -> List[Dict[str, any]]:
        """Returns dynamic radar representation for ACTIVE skills of the user."""
        SkillService.ensure_user_skills(db, user_id)
        
        # Only query skills that belong to this user AND are active
        user_skills = (
            db.query(UserSkill, Skill)
            .join(Skill, UserSkill.skill_id == Skill.id)
            .filter(UserSkill.user_id == user_id, Skill.user_id == user_id, Skill.is_active == True)
            .order_by(Skill.id.asc())
            .all()
        )

        results = []
        for us, s in user_skills:
            progress = XPService.get_level_progress(us.xp)
            results.append({
                "skill": s.name,
                "skill_id": s.id,
                "level": us.level,
                "xp": us.xp,
                "color": s.color,
                "icon": s.icon,
                "progress_percentage": progress["progress_percentage"],
                "value": us.level * 10 + int(progress["progress_percentage"] * 0.1),
                "full_mark": 100,
            })
        return results

    @staticmethod
    def get_user_skills_detail(db: Session, user_id: int) -> List[Dict[str, any]]:
        """Returns all skills of the user with their active status and XP progression."""
        SkillService.ensure_user_skills(db, user_id)
        
        user_skills = (
            db.query(UserSkill, Skill)
            .join(Skill, UserSkill.skill_id == Skill.id)
            .filter(UserSkill.user_id == user_id, Skill.user_id == user_id)
            .order_by(Skill.id.asc())
            .all()
        )

        detailed = []
        for us, s in user_skills:
            prog = XPService.get_level_progress(us.xp)
            detailed.append({
                "id": us.id,
                "skill_id": s.id,
                "name": s.name,
                "description": s.description or "",
                "icon": s.icon,
                "color": s.color,
                "is_active": s.is_active,
                "xp": us.xp,
                "level": us.level,
                "current_level_xp": prog["xp_into_level"],
                "next_level_xp": prog["next_level_xp"],
                "progress_percentage": prog["progress_percentage"],
            })
        return detailed
