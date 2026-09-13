import React, { useState } from 'react';
import { Calendar as CalendarIcon, Flame, Zap, Moon } from 'lucide-react';

const INTENSITY_COLORS = {
  0: 'bg-quest-900 border-quest-850',
  1: 'bg-emerald-950 border-emerald-900/60',
  2: 'bg-emerald-800 border-emerald-700/60',
  3: 'bg-emerald-600 border-emerald-500/60 shadow-sm shadow-emerald-500/30',
  4: 'bg-cyan-400 border-cyan-300 shadow-glow-cyan',
};

const ProductivityHeatmap = ({ heatmapData }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!heatmapData || heatmapData.length === 0) return null;

  // Group 365 days into 52 or 53 weeks (columns of 7 days)
  const weeks = [];
  let currentWeek = [];

  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="quest-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            Productivity Heatmap
          </h3>
          <span className="text-xs text-slate-400">
            52-week character activity, streak dedication, and XP output
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 self-start sm:self-auto">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-quest-900 border border-quest-850" />
          <div className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-cyan-400 border border-cyan-300" />
          <span>More</span>
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-quest-800 text-[11px] text-purple-400">
            <Moon className="w-3 h-3" /> Rest Day
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto pb-2">
        <div className="inline-flex gap-1 min-w-[720px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => {
                const color = INTENSITY_COLORS[day.level] || INTENSITY_COLORS[0];
                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-transform hover:scale-125 ${color} ${
                      day.is_rest_day ? 'ring-1 ring-purple-400/80' : ''
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      <div className="h-16 mt-3 pt-3 border-t border-quest-800 flex items-center">
        {hoveredCell ? (
          <div className="flex items-center gap-4 flex-wrap text-xs animate-fade-in">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
              <span className="font-bold text-slate-100">
                {new Date(hoveredCell.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">XP Earned</span>
              <span className="font-extrabold text-cyan-400">+{hoveredCell.xp} XP</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quests Cleared</span>
              <span className="font-bold text-slate-200">{hoveredCell.tasks_completed}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Focus Time</span>
              <span className="font-bold text-slate-200">{hoveredCell.productive_time} min</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Productivity</span>
              <span className="font-bold text-emerald-400">{hoveredCell.productivity_score}%</span>
            </div>
            {hoveredCell.is_rest_day && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[11px]">
                Rest Day (Streak Shielded)
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500 italic">
            Hover or tap any node in the grid to inspect historical productivity telemetry.
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductivityHeatmap;
