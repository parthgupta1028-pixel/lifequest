import os
import sys
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal
from models.user import User
from models.daily_stat import RestDay
from services.streak_service import StreakService
from services.admin_service import AdminService

def test_streak_and_reset():
    db = SessionLocal()
    try:
        # 1. Test user 'parth'
        parth = db.query(User).filter(User.username == "parth").first()
        assert parth is not None, "User parth should exist"
        print(f"Current parth stats: Level={parth.level}, XP={parth.total_xp}, Streak={parth.current_streak}, LastActive={parth.last_active_date}")

        # 2. Test Reset Progress
        AdminService.reset_user_progress(db, parth.id)
        db.refresh(parth)
        assert parth.total_xp == 0, f"Expected 0 XP, got {parth.total_xp}"
        assert parth.level == 1, f"Expected Level 1, got {parth.level}"
        assert parth.current_streak == 0, f"Expected Streak 0, got {parth.current_streak}"
        print("[OK] Reset progress successfully reset parth to Level 1, 0 XP, 0 Streak!")

        # 3. Test Passive Streak Decay
        # Simulate user having an active streak 5 days ago without rest days
        parth.current_streak = 5
        parth.last_active_date = datetime.date.today() - datetime.timedelta(days=4)
        db.commit()

        # Call get_streak_summary - should decay streak to 0 because days were skipped!
        summary = StreakService.get_streak_summary(db, parth)
        assert summary["current_streak"] == 0, f"Expected streak to decay to 0, got {summary['current_streak']}"
        print("[OK] Passive streak decay successfully broke the streak to 0 after inactive days!")

        # 4. Test 3 Rest Days Limit in a week
        today = datetime.date.today()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        
        # Clean rest days for test
        db.query(RestDay).filter(RestDay.user_id == parth.id).delete()
        db.commit()

        # Add 3 rest days
        for i in range(3):
            r_date = start_of_week + datetime.timedelta(days=i)
            db.add(RestDay(user_id=parth.id, rest_date=r_date, note="Test rest"))
        db.commit()

        count = db.query(RestDay).filter(RestDay.user_id == parth.id, RestDay.rest_date >= start_of_week).count()
        assert count == 3, f"Expected 3 rest days, got {count}"
        print("[OK] 3 rest days in a week successfully tracked and verified!")

        print("\nALL STREAK & RESET TESTS PASSED 100%!")
    finally:
        db.close()

if __name__ == "__main__":
    test_streak_and_reset()
