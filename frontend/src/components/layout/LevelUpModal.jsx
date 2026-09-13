import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Zap, Sparkles, ArrowUp, X } from 'lucide-react';

const LevelUpModal = () => {
  const { levelUpData, closeLevelUp } = useGame();

  if (!levelUpData) return null;

  const { new_level, previous_level, new_total_xp } = levelUpData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-quest-900 to-quest-950 border-2 border-cyan-400 rounded-3xl p-8 text-center shadow-glow-cyan overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={closeLevelUp}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-quest-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Level Up Emblem */}
        <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 border border-cyan-300">
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-300 animate-pulse" />
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-cyan-100 font-semibold block">Level</span>
            <span className="text-4xl font-black text-white font-display">{new_level}</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5" /> Character Ascended!
        </div>

        <h2 className="text-3xl font-extrabold text-white font-display mb-2">
          LEVEL UP!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Outstanding work! Your productivity has forged you into a higher tier of greatness.
        </p>

        {/* Stats card */}
        <div className="bg-quest-850/80 border border-quest-700/60 rounded-xl p-4 mb-6 flex justify-around items-center">
          <div>
            <span className="text-xs text-slate-400 block">Previous</span>
            <span className="text-lg font-bold text-slate-300">Level {previous_level}</span>
          </div>
          <ArrowUp className="w-6 h-6 text-emerald-400 animate-bounce" />
          <div>
            <span className="text-xs text-slate-400 block">New Rank</span>
            <span className="text-xl font-extrabold text-cyan-300">Level {new_level}</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-6">
          Total Character XP: <span className="text-cyan-400 font-bold">{new_total_xp.toLocaleString()} XP</span>
        </div>

        <button
          onClick={closeLevelUp}
          className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display uppercase tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
        >
          Claim Glory & Continue
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
