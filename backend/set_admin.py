import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.user import User

def set_admin_role(username: str, make_admin: bool = True):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: User '{username}' not found.")
            return False
        
        new_role = "admin" if make_admin else "user"
        user.role = new_role
        db.commit()
        print(f"Success: User '{username}' is now '{new_role}'.")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python set_admin.py <username> [--demote]")
        sys.exit(1)
    
    uname = sys.argv[1]
    demote = "--demote" in sys.argv
    set_admin_role(uname, make_admin=not demote)
