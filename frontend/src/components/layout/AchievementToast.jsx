import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, X, Sparkles } from 'lucide-react';

const AchievementToast = () => {
  const { activeAchievement, closeAchievement } = useGame();

  if (!activeAchievement) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-gradient-to-r from-amber-950/90 to-quest-900/90 border-2 border-amber-400/80 rounded-2xl p-4 shadow-glow-gold backdrop-blur-md animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
          <Trophy className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Achievement Unlocked!
          </div>
          <h4 className="text-base font-extrabold text-white truncate font-display">
            {activeAchievement.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
            {activeAchievement.description}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
            +{activeAchievement.xp_bonus} Bonus XP
          </div>
        </div>

        <button
          onClick={closeAchievement}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-quest-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
