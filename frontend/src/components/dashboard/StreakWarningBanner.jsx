import React from 'react';
import { AlertTriangle, Flame, Clock, Moon, ArrowRight } from 'lucide-react';

const StreakWarningBanner = ({ streak, onNavigateRestDay }) => {
  if (!streak || !streak.is_at_risk) {
    return null;
  }

  const hoursLeft = streak.hours_until_midnight || 0;
  const currentStreak = streak.current_streak || 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-500/40 p-4 sm:p-5 shadow-lg backdrop-blur-md animate-pulse-slow">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0">
            <Flame className="w-5 h-5 fill-current animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Streak in Danger
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{hoursLeft}h left before midnight
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
              Your <strong className="text-amber-600 dark:text-amber-400">{currentStreak}-day streak</strong> will break tonight if you don't complete at least one quest or record a Rest Day!
            </p>
          </div>
        </div>

        {onNavigateRestDay && (
          <button
            onClick={onNavigateRestDay}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md flex-shrink-0"
          >
            <Moon className="w-4 h-4" />
            <span>Schedule Rest Day</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StreakWarningBanner;
