r"""
LifeQuest - Database User Inspector
Run this script to inspect all registered users, their stats, XP, levels, and achievements.
Usage:
    cd backend
    .\.venv\Scripts\python.exe view_users.py
"""

from database import SessionLocal
from models.user import User
from models.task_instance import TaskInstance
from models.achievement import Achievement, UserAchievement
from models.skill import Skill, UserSkill

def display_users():
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id.asc()).all()
        print("=" * 80)
        print("LIFEQUEST - REGISTERED DATABASE USERS")
        print("=" * 80)

        if not users:
            print("No users found in the database.")
            return

        for user in users:
            completed_tasks = (
                db.query(TaskInstance)
                .filter(TaskInstance.user_id == user.id, TaskInstance.status == "COMPLETED")
                .count()
            )
            unlocked_achievements = (
                db.query(UserAchievement)
                .filter(UserAchievement.user_id == user.id)
                .count()
            )

            print(f"\n[USER #{user.id}] {user.username.upper()}")
            print(f"   * Email:               {user.email}")
            print(f"   * Character Level:     Level {user.level}")
            print(f"   * Total XP:            {user.total_xp:,} XP")
            print(f"   * Active Streak:       {user.current_streak} days (Best: {user.best_streak} days)")
            print(f"   * Quests Completed:    {completed_tasks}")
            print(f"   * Trophies Unlocked:   {unlocked_achievements}")
            print(f"   * Registered At:       {user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else 'N/A'}")
            print(f"   * Last Active Date:    {user.last_active_date or 'None'}")

            # Display user's 6 skills
            user_skills = (
                db.query(UserSkill, Skill)
                .join(Skill, UserSkill.skill_id == Skill.id)
                .filter(UserSkill.user_id == user.id)
                .all()
            )
            if user_skills:
                skill_summary = ", ".join([f"{s.name}: Lvl {us.level} ({us.xp} XP)" for us, s in user_skills])
                print(f"   * Attributes:          {skill_summary}")

        print("\n" + "=" * 80)
        print(f"Total Users in Database: {len(users)}\n")
    finally:
        db.close()

if __name__ == "__main__":
    display_users()
