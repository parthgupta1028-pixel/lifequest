import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Hexagon, 
  Triangle, 
  Square, 
  Pentagon, 
  Octagon, 
  SlidersHorizontal, 
  Zap, 
  Plus 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const POLYGON_CONFIG = {
  1: { name: 'Single Attribute Focus', icon: Zap },
  2: { name: 'Dual-Axis Balance Matrix', icon: SlidersHorizontal },
  3: { name: 'Triangle Skill Matrix', icon: Triangle },
  4: { name: 'Square Skill Matrix', icon: Square },
  5: { name: 'Pentagon Skill Matrix', icon: Pentagon },
  6: { name: 'Hexagon Skill Matrix', icon: Hexagon },
  7: { name: 'Heptagon Skill Matrix', icon: Hexagon },
  8: { name: 'Octagon Skill Matrix', icon: Octagon },
};

const SkillHexagonRadar = ({ radarData = [], onNavigateSkills }) => {
  const { isDark } = useTheme();

  if (!radarData || radarData.length === 0) {
    return (
      <div className="quest-card p-6 flex flex-col items-center justify-center text-center min-h-[340px]">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
          <Hexagon className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-1">
          No Active Skills Configured
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          Activate or forge custom skills to generate your dynamic character attribute polygon.
        </p>
        {onNavigateSkills && (
          <button
            onClick={onNavigateSkills}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:from-cyan-400 hover:to-blue-500 transition"
          >
            <Plus className="w-4 h-4" /> Configure Skills
          </button>
        )}
      </div>
    );
  }

  const count = radarData.length;
  const polyInfo = POLYGON_CONFIG[count] || {
    name: `${count}-Sided Skill Polygon`,
    icon: Hexagon,
  };
  const ShapeIcon = polyInfo.icon;

  // Format data for Recharts
  const chartData = radarData.map((item) => ({
    skill: item.skill,
    level: item.level,
    value: Math.max(15, Math.min(100, item.level * 15 + Math.round((item.progress_percentage || 0) * 0.15))),
    rawLevel: item.level,
    xp: item.xp,
    color: item.color || '#06b6d4',
  }));

  const gridStroke = isDark ? '#233054' : '#e2e8f0';
  const tickFill = isDark ? '#94a3b8' : '#475569';

  return (
    <div className="quest-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShapeIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              {polyInfo.name}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {count} Active Attribute{count > 1 ? 's' : ''} Progression
            </span>
          </div>
        </div>

        {onNavigateSkills && (
          <button
            onClick={onNavigateSkills}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline transition"
          >
            Customize →
          </button>
        )}
      </div>

      {/* Dynamic Polygon or Dual-Axis Display */}
      {count === 2 ? (
        <div className="my-4 py-4 px-3 space-y-4">
          <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            2-Axis Dual Attribute Balance
          </div>
          {chartData.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.skill}
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-display">LVL {item.level}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-quest-950 rounded-full overflow-hidden border border-slate-200 dark:border-quest-850">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(10, item.value)}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-64 -my-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
              <PolarGrid stroke={gridStroke} strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: tickFill, fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="#06b6d4"
                fillOpacity={isDark ? 0.35 : 0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mini Active Skills Pills Row */}
      <div className={`grid ${count <= 3 ? 'grid-cols-3' : count <= 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 pt-3 border-t border-slate-200 dark:border-quest-800 text-center`}>
        {radarData.map((s, idx) => (
          <div 
            key={idx} 
            className="p-1.5 rounded-xl bg-slate-50 dark:bg-quest-950/60 border border-slate-200 dark:border-quest-850"
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              {s.skill}
            </span>
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-300 font-display">
              LVL {s.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillHexagonRadar;
