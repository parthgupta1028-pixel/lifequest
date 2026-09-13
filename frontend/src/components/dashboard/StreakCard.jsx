import React, { useState } from 'react';
import { Flame, Moon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { restDaysAPI } from '../../services/api';

const StreakCard = ({ streakInfo, onRestDayToggled }) => {
  const [loading, setLoading] = useState(false);

  if (!streakInfo) return null;

  const { current_streak, best_streak, productive_days, is_today_rest } = streakInfo;

  const handleToggleRestDay = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      if (is_today_rest) {
        await restDaysAPI.removeRestDay(todayStr);
      } else {
        await restDaysAPI.addRestDay({ rest_date: todayStr, note: 'Rest & Recovery' });
      }
      if (onRestDayToggled) onRestDayToggled();
    } catch (err) {
      console.error('Failed to toggle rest day:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quest-card p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Momentum
          </span>
          <h3 className="text-xl font-bold font-display text-white mt-0.5">
            Streak Counter
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glow-gold">
          <Flame className="w-6 h-6 fill-current animate-pulse" />
        </div>
      </div>

      {/* Streak Big Numbers */}
      <div className="my-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black font-display text-white">
            {current_streak}
          </span>
          <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Days Streak
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <div>
            Best: <strong className="text-slate-200">{best_streak} days</strong>
          </div>
          <span>•</span>
          <div>
            Total Productive: <strong className="text-slate-200">{productive_days} days</strong>
          </div>
        </div>
      </div>

      {/* Rest Day Protector Button */}
      <div className="pt-2 border-t border-quest-800">
        <button
          onClick={handleToggleRestDay}
          disabled={loading}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            is_today_rest
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
              : 'bg-quest-800 hover:bg-quest-750 text-slate-300 hover:text-white border border-quest-700'
          }`}
        >
          <Moon className="w-4 h-4 text-purple-400" />
          <span>{is_today_rest ? 'Rest Day Active (Streak Protected)' : 'Mark Today as Rest Day'}</span>
        </button>
      </div>
    </div>
  );
};

export default StreakCard;
