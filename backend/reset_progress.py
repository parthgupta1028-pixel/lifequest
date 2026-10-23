import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
from models.user import User
from services.admin_service import AdminService

def reset_progress(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: User '{username}' not found.")
            return False
        AdminService.reset_user_progress(db, user.id)
        print(f"Success: All XP, level, streaks, and completed tasks for '{username}' have been reset to 0 / Level 1!")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reset_progress.py <username>")
        sys.exit(1)
    reset_progress(sys.argv[1])
