import os
import sys
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal, Base, engine
from models.user import User
from models.skill import Skill, UserSkill
from models.category import Category
from models.achievement import Achievement
from models.task import Task
from models.task_instance import TaskInstance
from auth.security import hash_password
from services.skill_service import SkillService
from services.task_service import TaskService
from services.achievement_service import AchievementService

def seed():
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Ensure categories & achievements
        TaskService.ensure_default_categories(db)
        AchievementService.ensure_default_achievements(db)

        # 1. Admin Account: parth
        parth = db.query(User).filter(User.username == "parth").first()
        if not parth:
            parth = User(
                username="parth",
                email="parthgupta1001pg@gmail.com",
                hashed_password=hash_password("P@rth1028"),
                role="admin",
                level=1,
                total_xp=0,
                current_streak=1,
                best_streak=1,
                last_active_date=datetime.date.today(),
                is_active=True
            )
            db.add(parth)
            db.commit()
            db.refresh(parth)
            print(f"Created admin user: {parth.username} (id={parth.id})")
        else:
            parth.role = "admin"
            parth.hashed_password = hash_password("P@rth1028")
            db.commit()
            print("Updated existing parth user")

        # 2. Demo User: quest_hero
        hero = db.query(User).filter(User.username == "quest_hero").first()
        if not hero:
            hero = User(
                username="quest_hero",
                email="hero@lifequest.io",
                hashed_password=hash_password("demo123"),
                role="user",
                level=3,
                total_xp=450,
                current_streak=4,
                best_streak=7,
                last_active_date=datetime.date.today(),
                is_active=True
            )
            db.add(hero)
            db.commit()
            db.refresh(hero)
            print(f"Created demo user: {hero.username} (id={hero.id})")
        else:
            hero.role = "user"
            hero.hashed_password = hash_password("demo123")
            db.commit()

        # Seed Skills for users
        default_skills = [
            ("Coding & DSA", "Programming, algorithms, and software engineering", "code", "#06B6D4"),
            ("Academic Study", "Coursework, lectures, and exams", "book-open", "#8B5CF6"),
            ("Fitness & Health", "Workout, cardio, and physical health", "dumbbell", "#10B981"),
            ("Deep Focus", "Distraction-free high cognitive output", "brain", "#F59E0B"),
            ("Communication", "Presentation, writing, and leadership", "message-square", "#EC4899"),
        ]

        for user_obj in [parth, hero]:
            for name, desc, icon, color in default_skills:
                existing = db.query(Skill).filter(Skill.user_id == user_obj.id, Skill.name == name).first()
                if not existing:
                    sk = Skill(
                        user_id=user_obj.id,
                        name=name,
                        description=desc,
                        icon=icon,
                        color=color,
                        is_active=True
                    )
                    db.add(sk)
                    db.commit()
                    db.refresh(sk)
                    
                    usk = UserSkill(
                        user_id=user_obj.id,
                        skill_id=sk.id,
                        xp=80 if user_obj.username == "quest_hero" else 0,
                        level=2 if user_obj.username == "quest_hero" else 1
                    )
                    db.add(usk)
            db.commit()

        # Seed sample tasks for quest_hero
        sample_tasks = [
            ("Solve 2 LeetCode Problems", "Complete daily algorithm practice", "HIGH", 45, 60),
            ("Review System Architecture Notes", "Study database normalization and caching", "MEDIUM", 30, 40),
            ("30-Minute HIIT Cardio", "Morning workout routine", "HIGH", 30, 50),
            ("Read Technical Documentation", "Explore FastAPI and SQLAlchemy docs", "LOW", 20, 25),
        ]

        coding_skill = db.query(Skill).filter(Skill.user_id == hero.id, Skill.name.like("%Coding%")).first()
        study_skill = db.query(Skill).filter(Skill.user_id == hero.id, Skill.name.like("%Study%")).first()
        fitness_skill = db.query(Skill).filter(Skill.user_id == hero.id, Skill.name.like("%Fitness%")).first()

        for idx, (title, desc, priority, duration, xp) in enumerate(sample_tasks):
            t = db.query(Task).filter(Task.user_id == hero.id, Task.title == title).first()
            if not t:
                sk_id = coding_skill.id if idx == 0 else (study_skill.id if idx == 1 else (fitness_skill.id if idx == 2 else None))
                t = Task(
                    user_id=hero.id,
                    skill_id=sk_id,
                    title=title,
                    description=desc,
                    priority=priority,
                    estimated_duration=duration,
                    xp_reward=xp,
                    is_active=True
                )
                db.add(t)
                db.commit()
                db.refresh(t)

                # Create today's instance
                inst = TaskInstance(
                    task_id=t.id,
                    user_id=hero.id,
                    occurrence_date=datetime.date.today(),
                    status="COMPLETED" if idx == 0 else "PENDING",
                    planned_duration=duration,
                    actual_duration=duration if idx == 0 else 0,
                    xp_awarded=xp if idx == 0 else 0,
                    completed_at=datetime.datetime.utcnow() if idx == 0 else None
                )
                db.add(inst)
        db.commit()

        # Seed 1 starter task for parth
        parth_coding = db.query(Skill).filter(Skill.user_id == parth.id, Skill.name.like("%Coding%")).first()
        p_task = db.query(Task).filter(Task.user_id == parth.id).first()
        if not p_task:
            p_task = Task(
                user_id=parth.id,
                skill_id=parth_coding.id if parth_coding else None,
                title="Explore LifeQuest Features",
                description="Complete the first quest to start earning XP and level up",
                priority="HIGH",
                estimated_duration=15,
                xp_reward=50,
                is_active=True
            )
            db.add(p_task)
            db.commit()
            db.refresh(p_task)

            p_inst = TaskInstance(
                task_id=p_task.id,
                user_id=parth.id,
                occurrence_date=datetime.date.today(),
                status="PENDING",
                planned_duration=15,
                actual_duration=0,
                xp_awarded=0
            )
            db.add(p_inst)
            db.commit()

        print("SEEDING COMPLETE!")
        
        # Verify users
        users = db.query(User).all()
        for u in users:
            print(f"User: id={u.id}, username={u.username}, role={u.role}, email={u.email}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
