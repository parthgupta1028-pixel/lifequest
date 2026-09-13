import React from 'react';
import { Zap, CheckCircle2, Clock, Hourglass } from 'lucide-react';

const QuickStatsRow = ({ quickStats }) => {
  if (!quickStats) return null;

  const stats = [
    {
      label: "Today's XP",
      value: `+${quickStats.today_xp || 0}`,
      icon: Zap,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      label: 'Quests Cleared',
      value: quickStats.tasks_completed || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      label: 'Quests Pending',
      value: quickStats.tasks_pending || 0,
      icon: Hourglass,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      label: 'Productive Time',
      value: `${quickStats.productive_minutes || 0}m`,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="quest-card p-4 flex items-center gap-3.5"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${s.bg} ${s.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {s.label}
              </span>
              <span className="text-xl font-black font-display text-white">
                {s.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStatsRow;
