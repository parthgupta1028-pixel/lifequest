import math
from typing import Tuple, Dict

class XPService:
    @staticmethod
    def xp_required_for_level(level: int) -> int:
        """Calculate total cumulative XP required to reach a specific level."""
        if level <= 1:
            return 0
        # Sensible exponential curve: Level 2 = 100 XP, Level 3 = 283 XP, Level 4 = 520 XP, Level 7 = 1470 XP, Level 10 = 2700 XP
        return int(round(100 * ((level - 1) ** 1.5)))

    @staticmethod
    def calculate_level_from_xp(total_xp: int) -> int:
        """Calculate character level from total accumulated XP."""
        if total_xp <= 0:
            return 1
        level = 1
        while True:
            next_req = XPService.xp_required_for_level(level + 1)
            if total_xp < next_req:
                return level
            level += 1

    @staticmethod
    def get_level_progress(total_xp: int) -> Dict[str, any]:
        """Return level details, current level progress, and XP needed for next level."""
        level = XPService.calculate_level_from_xp(total_xp)
        current_level_base = XPService.xp_required_for_level(level)
        next_level_target = XPService.xp_required_for_level(level + 1)
        
        span = next_level_target - current_level_base
        xp_into_level = max(0, total_xp - current_level_base)
        percentage = round(min(100.0, (xp_into_level / span) * 100.0), 1) if span > 0 else 100.0

        return {
            "level": level,
            "total_xp": total_xp,
            "current_level_base_xp": current_level_base,
            "next_level_xp": next_level_target,
            "xp_into_level": xp_into_level,
            "xp_needed_for_next_level": max(0, next_level_target - total_xp),
            "progress_percentage": percentage,
        }

    @staticmethod
    def award_xp(current_total_xp: int, xp_to_add: int) -> Tuple[int, int, int, bool]:
        """
        Awards XP.
        Returns: (new_total_xp, old_level, new_level, did_level_up)
        """
        old_level = XPService.calculate_level_from_xp(current_total_xp)
        new_total_xp = current_total_xp + max(0, xp_to_add)
        new_level = XPService.calculate_level_from_xp(new_total_xp)
        did_level_up = new_level > old_level
        return new_total_xp, old_level, new_level, did_level_up
