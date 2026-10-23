import datetime
from typing import Tuple, Dict, Any
from sqlalchemy.orm import Session
from models.user import User
from models.daily_stat import RestDay, DailyStat

class StreakService:
    @staticmethod
    def is_date_rest_day(db: Session, user_id: int, target_date: datetime.date) -> bool:
        """Checks if a given date is marked as a Rest Day by the user."""
        return (
            db.query(RestDay)
            .filter(RestDay.user_id == user_id, RestDay.rest_date == target_date)
            .first()
            is not None
        )

    @staticmethod
    def update_streak_on_completion(db: Session, user: User, activity_date: datetime.date) -> Tuple[int, int]:
        """
        Updates streak upon completing an activity on activity_date.
        Respects Rest Days (does not break streak if intervening days were rest days).
        Returns: (new_current_streak, new_best_streak)
        """
        if user.last_active_date == activity_date:
            # Already active today, streak already counted
            return user.current_streak, user.best_streak

        if user.last_active_date is None:
            # First activity ever
            user.current_streak = 1
            user.best_streak = max(user.best_streak, 1)
            user.last_active_date = activity_date
            db.commit()
            return user.current_streak, user.best_streak

        day_diff = (activity_date - user.last_active_date).days

        if day_diff == 1:
            # Consecutive day!
            user.current_streak += 1
        elif day_diff > 1:
            # Check if all skipped days were valid Rest Days (Max 3 rest days per week)
            all_rest = True
            for i in range(1, day_diff):
                check_date = user.last_active_date + datetime.timedelta(days=i)
                if not StreakService.is_date_rest_day(db, user.id, check_date):
                    all_rest = False
                    break
                
                # Check maximum 3 rest days allowed in this calendar week
                start_of_week = check_date - datetime.timedelta(days=check_date.weekday())
                end_of_week = start_of_week + datetime.timedelta(days=6)
                week_rest_count = (
                    db.query(RestDay)
                    .filter(
                        RestDay.user_id == user.id,
                        RestDay.rest_date >= start_of_week,
                        RestDay.rest_date <= end_of_week
                    )
                    .count()
                )
                if week_rest_count > 3:
                    all_rest = False
                    break

            if all_rest:
                # Streak protected by Rest Days!
                user.current_streak += 1
            else:
                # Streak broken, reset to 1
                user.current_streak = 1
        else:
            # Activity on an earlier date, does not modify current forward streak
            return user.current_streak, user.best_streak

        user.best_streak = max(user.best_streak, user.current_streak)
        user.last_active_date = activity_date
        db.commit()
        return user.current_streak, user.best_streak

    @staticmethod
    def check_and_decay_streak(db: Session, user: User) -> int:
        """
        Passively checks if streak has broken due to inactivity.
        If yesterday was skipped and was NOT a valid rest day (or > 3 rest days in that week),
        the streak is broken and resets to 0.
        """
        if user.current_streak == 0 or user.last_active_date is None:
            return 0

        today = datetime.date.today()
        if user.last_active_date >= today:
            return user.current_streak

        yesterday = today - datetime.timedelta(days=1)
        if user.last_active_date == yesterday:
            # Yesterday was active, streak is currently alive waiting for today's activity
            return user.current_streak

        # If last active was before yesterday, check intervening days
        cur_date = user.last_active_date + datetime.timedelta(days=1)
        streak_valid = True

        while cur_date <= yesterday:
            if not StreakService.is_date_rest_day(db, user.id, cur_date):
                streak_valid = False
                break

            # Enforce max 3 rest days in that calendar week
            start_of_week = cur_date - datetime.timedelta(days=cur_date.weekday())
            end_of_week = start_of_week + datetime.timedelta(days=6)
            week_rest_count = (
                db.query(RestDay)
                .filter(
                    RestDay.user_id == user.id,
                    RestDay.rest_date >= start_of_week,
                    RestDay.rest_date <= end_of_week
                )
                .count()
            )
            if week_rest_count > 3:
                streak_valid = False
                break

            cur_date += datetime.timedelta(days=1)

        if not streak_valid:
            user.current_streak = 0
            db.commit()

        return user.current_streak

    @staticmethod
    def get_streak_summary(db: Session, user: User) -> Dict[str, Any]:
        """Returns comprehensive streak info with passive streak validation."""
        StreakService.check_and_decay_streak(db, user)
        today = datetime.date.today()
        productive_days = (
            db.query(DailyStat)
            .filter(DailyStat.user_id == user.id, DailyStat.tasks_completed > 0)
            .count()
        )
        total_rest_days = db.query(RestDay).filter(RestDay.user_id == user.id).count()

        # Check if user has completed something today or if today is a rest day
        is_today_active = user.last_active_date == today
        is_today_rest = StreakService.is_date_rest_day(db, user.id, today)

        return {
            "current_streak": user.current_streak,
            "best_streak": user.best_streak,
            "productive_days": productive_days,
            "total_rest_days": total_rest_days,
            "is_today_active": is_today_active,
            "is_today_rest": is_today_rest,
            "last_active_date": user.last_active_date,
        }
