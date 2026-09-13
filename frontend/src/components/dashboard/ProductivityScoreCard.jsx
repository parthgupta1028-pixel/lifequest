import React from 'react';
import { Target, Info, CheckCircle, Clock, Award } from 'lucide-react';

const ProductivityScoreCard = ({ scoreData }) => {
  if (!scoreData) return null;

  const score = scoreData.total_score || 0;
  const isRest = scoreData.is_rest_day;

  // Determine score tint
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-glow-emerald';
  if (score < 50) {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-glow-gold';
  } else if (score < 80) {
    colorClass = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-glow-cyan';
  }

  return (
    <div className="quest-card p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance Metric
          </span>
          <h3 className="text-xl font-bold font-display text-white mt-0.5">
            Today's Productivity
          </h3>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border ${colorClass}`}>
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* Big Score Display */}
      <div className="my-4 flex items-center gap-5">
        <div className="text-5xl font-black font-display text-white tracking-tight">
          {score}%
        </div>
        <div className="text-xs text-slate-400 leading-relaxed border-l border-quest-800 pl-4">
          {isRest ? (
            <span className="text-purple-300 font-semibold">
              Rest day logged. Rest and recovery restores 100% vital efficiency.
            </span>
          ) : (
            scoreData.explanation || 'Complete scheduled quests to elevate your daily rating.'
          )}
        </div>
      </div>

      {/* Understandable calculation metrics */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-quest-800 text-center">
        <div className="p-2 rounded-xl bg-quest-950/60">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Quests</span>
          <span className="text-xs font-bold text-slate-200">
            {scoreData.tasks_completed || 0}/{scoreData.tasks_total || 0}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-quest-950/60">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">XP Today</span>
          <span className="text-xs font-bold text-cyan-300">
            +{scoreData.xp_earned_today || 0} XP
          </span>
        </div>

        <div className="p-2 rounded-xl bg-quest-950/60">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Focus Time</span>
          <span className="text-xs font-bold text-slate-200">
            {scoreData.productive_time_minutes || 0}m
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityScoreCard;
