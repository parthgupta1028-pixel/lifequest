import datetime
import json
from database import engine, Base, SessionLocal
import models
from models.user import User
from models.skill import Skill, UserSkill
from models.category import Category
from models.task import Task
from models.task_instance import TaskInstance
from services.task_service import TaskService
from services.skill_service import SkillService
from services.achievement_service import AchievementService
from services.xp_service import XPService
from services.streak_service import StreakService
from services.productivity_service import ProductivityService
from services.mission_service import MissionService
from auth.security import hash_password, verify_password
from auth.jwt import create_access_token

def test_full_pipeline():
    print("=== STARTING LIFEQUEST BACKEND INTEGRATION TEST ===")
    
    # 1. Initialize Tables & Seeds
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    SkillService.ensure_default_skills(db)
    TaskService.ensure_default_categories(db)
    AchievementService.ensure_default_achievements(db)

    skills = db.query(Skill).all()
    categories = db.query(Category).all()
    print(f"[OK] Seeded {len(skills)} core skills and {len(categories)} default categories.")
    assert len(skills) == 6, f"Expected 6 skills, got {len(skills)}"

    # 2. Register User
    pwd = "secretpassword123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed), "Password verification failed"

    user = User(
        username="quest_hero",
        email="hero@lifequest.io",
        hashed_password=hashed,
        level=1,
        total_xp=0,
        current_streak=0,
        best_streak=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"[OK] Created User: {user.username} (ID: {user.id})")

    SkillService.ensure_user_skills(db, user.id)
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    assert len(user_skills) == 6, "User skills not initialized"
    print(f"[OK] Initialized 6 user skills.")

    # 3. Create Tasks
    coding_cat = db.query(Category).filter(Category.name == "Coding").first()
    coding_skill = db.query(Skill).filter(Skill.name == "Coding").first()

    from schemas.task import TaskCreate
    task_data = TaskCreate(
        title="Practice Python Algorithms",
        description="LeetCode medium array problems",
        category_id=coding_cat.id,
        skill_id=coding_skill.id,
        priority="HIGH",
        estimated_duration=60,
        recurrence="DAILY",
        xp_reward=50,
        is_active=True,
    )
    task = TaskService.create_task(db, user.id, task_data)
    print(f"[OK] Created Recurring Task: {task.title} (Recurrence: {task.recurrence}, XP: {task.xp_reward})")

    # 4. Sync today's instances
    today = datetime.date.today()
    instances = TaskService.sync_instances_for_date(db, user.id, today)
    assert len(instances) >= 1, "No instance created for today"
    today_instance = instances[0]
    print(f"[OK] Generated Instance for {today_instance.occurrence_date}: Status={today_instance.status}, Planned={today_instance.planned_duration}m")

    # 5. Timer simulation (72 minutes actual vs 60 planned -> +12 min diff)
    today_instance.actual_duration = 72
    today_instance.timer_seconds = 72 * 60
    db.commit()
    diff = today_instance.actual_duration - today_instance.planned_duration
    print(f"[OK] Time Tracking Diff: Planned={today_instance.planned_duration}m, Actual={today_instance.actual_duration}m, Diff=+{diff}m")

    # 6. Complete Task Instance & Award XP
    earned_xp = today_instance.task.xp_reward
    today_instance.xp_awarded = earned_xp
    today_instance.status = "COMPLETED"
    today_instance.completed_at = datetime.datetime.utcnow()
    db.commit()

    # User XP and level
    user.total_xp, old_lvl, new_lvl, did_lvl_up = XPService.award_xp(user.total_xp, earned_xp)
    user.level = new_lvl
    db.commit()
    print(f"[OK] Completed Task! Total XP={user.total_xp}, Level={user.level} (Leveled Up: {did_lvl_up})")

    # Skill XP
    skill_name, new_skill_xp, new_skill_lvl, skill_up = SkillService.add_skill_xp(
        db, user.id, coding_skill.id, earned_xp
    )
    print(f"[OK] Skill '{skill_name}' XP={new_skill_xp}, Level={new_skill_lvl}")

    # Streak update
    StreakService.update_streak_on_completion(db, user, today)
    print(f"[OK] Streak Updated: Current={user.current_streak}, Best={user.best_streak}")

    # Productivity Score
    score = ProductivityService.calculate_daily_score(db, user.id, today)
    print(f"[OK] Productivity Score={score['total_score']}%: {score['explanation']}")

    # Achievements check
    unlocked = AchievementService.check_and_unlock(db, user)
    print(f"[OK] Unlocked {len(unlocked)} Achievements: {[a['title'] for a in unlocked]}")
    assert any(a["code"] == "first_task" for a in unlocked), "First task achievement should unlock"

    # Daily Mission check
    mission = MissionService.get_or_create_daily_mission(db, user, today)
    mission_items = json.loads(mission.items_json)
    print(f"[OK] Daily Mission: '{mission.title}' with {len(mission_items)} goals. Completed={mission.is_completed}")

    # 7. Crucial Data Rule verification:
    # "Previously completed work must never disappear when a recurring task is edited. If edited from 50 to 30, historical remains 50!"
    from schemas.task import TaskUpdate
    TaskService.update_task(db, user.id, task.id, TaskUpdate(xp_reward=30, estimated_duration=45))
    db.refresh(today_instance)
    assert today_instance.xp_awarded == 50, f"Expected 50 immutable historical XP, got {today_instance.xp_awarded}"
    print(f"[VERIFIED] Task updated to 30 XP, but historical instance immutably retained {today_instance.xp_awarded} XP!")

    # 8. Rest Day test
    from models.daily_stat import RestDay
    tomorrow = today + datetime.timedelta(days=1)
    rest_day = RestDay(user_id=user.id, rest_date=tomorrow, note="Rest & recovery day")
    db.add(rest_day)
    db.commit()
    assert StreakService.is_date_rest_day(db, user.id, tomorrow), "Rest day detection failed"
    print(f"[OK] Logged Rest Day for {tomorrow}. Streak protected!")

    db.close()
    print("=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_full_pipeline()
