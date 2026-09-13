import React from 'react';
import { Sparkles, Trophy, Zap, Shield } from 'lucide-react';

const HeroLevelCard = ({ user }) => {
  if (!user) return null;

  const prog = user.level_progress || {
    level: user.level,
    total_xp: user.total_xp,
    xp_into_level: 0,
    xp_needed_for_next_level: 100,
    progress_percentage: 0,
    next_level_xp: 100,
  };

  return (
    <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-quest-900 via-quest-850 to-quest-900 border border-quest-800 shadow-xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          {/* Level Shield Emblem */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-glow-cyan shrink-0 border border-cyan-300">
            <Shield className="w-9 h-9 text-slate-950 fill-cyan-400" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black font-display text-slate-950">
              {user.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Champion Rank
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                Tier {Math.ceil(user.level / 3)}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">
              {user.username}
            </h2>
          </div>
        </div>

        {/* Total XP stat pill */}
        <div className="text-left sm:text-right bg-quest-950/70 border border-quest-800/80 px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Accumulated XP
          </span>
          <span className="text-xl font-black text-cyan-300 font-display flex items-center gap-1">
            <Zap className="w-4 h-4 fill-current text-cyan-400" />
            {user.total_xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">
            Progress to <span className="text-cyan-400">Level {user.level + 1}</span>
          </span>
          <span className="text-slate-400">
            <strong className="text-cyan-300">{prog.xp_into_level}</strong> / {prog.xp_into_level + prog.xp_needed_for_next_level} XP ({prog.progress_percentage}%)
          </span>
        </div>

        <div className="relative w-full h-3.5 bg-quest-950 rounded-full p-0.5 border border-quest-800 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full relative transition-all duration-500 shadow-glow-cyan"
            style={{ width: `${Math.max(4, prog.progress_percentage)}%` }}
          >
            <div className="absolute inset-0 xp-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Level {user.level} Threshold</span>
          <span>{prog.xp_needed_for_next_level} XP needed for promotion</span>
        </div>
      </div>
    </div>
  );
};

export default HeroLevelCard;
