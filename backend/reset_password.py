import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
from models.user import User
from auth.security import hash_password

def reset_password(username: str, new_password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: User '{username}' not found.")
            return False
        user.hashed_password = hash_password(new_password)
        db.commit()
        print(f"Success: Password for '{username}' has been updated!")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reset_password.py <username> <new_password>")
        sys.exit(1)
    reset_password(sys.argv[1], sys.argv[2])
