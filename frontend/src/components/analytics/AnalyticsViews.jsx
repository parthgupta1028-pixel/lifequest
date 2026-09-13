import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { Zap, Clock, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export const DailyAnalyticsView = ({ dailyData }) => {
  if (!dailyData) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Productivity Rating
          </span>
          <div className="text-4xl font-black font-display text-emerald-400 mt-2">
            {dailyData.total_score}%
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {dailyData.explanation}
          </p>
        </div>

        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            XP Yield Today
          </span>
          <div className="text-4xl font-black font-display text-cyan-300 mt-2">
            +{dailyData.xp_earned_today} XP
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Earned from completing quest objectives today
          </p>
        </div>

        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Focus Time Logged
          </span>
          <div className="text-4xl font-black font-display text-purple-400 mt-2">
            {dailyData.productive_time_minutes}m
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Recorded via live quest stopwatches
          </p>
        </div>
      </div>
    </div>
  );
};

export const WeeklyAnalyticsView = ({ weeklyData }) => {
  if (!weeklyData) return null;

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="quest-card p-4">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">7-Day XP Output</span>
          <div className="text-2xl font-black text-cyan-300 mt-1 font-display">
            +{weeklyData.total_xp_7d} XP
          </div>
        </div>
        <div className="quest-card p-4">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Quests Finished</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-display">
            {weeklyData.total_tasks_7d}
          </div>
        </div>
        <div className="quest-card p-4">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Productive Hours</span>
          <div className="text-2xl font-black text-purple-400 mt-1 font-display">
            {weeklyData.total_hours_7d} hrs
          </div>
        </div>
        <div className="quest-card p-4">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Streak Status</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-display">
            {weeklyData.current_streak} Days
          </div>
        </div>
      </div>

      {/* 7-Day XP Bar Chart */}
      <div className="quest-card p-6">
        <h4 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          7-Day XP Output Progression
        </h4>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData.days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18223c" vertical={false} />
              <XAxis dataKey="day_name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#233054', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ fill: '#18223c', opacity: 0.5 }}
              />
              <Bar dataKey="xp" fill="#06b6d4" radius={[6, 6, 0, 0]} name="XP Earned" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity Score Trend Line Chart */}
      <div className="quest-card p-6">
        <h4 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          7-Day Productivity Rating (%)
        </h4>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData.days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18223c" vertical={false} />
              <XAxis dataKey="day_name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#233054', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="productivity_score" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981' }} 
                name="Productivity %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const MonthlyAnalyticsView = ({ monthlyData }) => {
  if (!monthlyData) return null;

  return (
    <div className="space-y-6">
      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">30-Day XP Gain</span>
          <div className="text-3xl font-black text-cyan-300 mt-1 font-display">
            +{monthlyData.total_xp_30d} XP
          </div>
        </div>
        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Quests Cleared</span>
          <div className="text-3xl font-black text-emerald-400 mt-1 font-display">
            {monthlyData.total_completed_tasks_30d}
          </div>
        </div>
        <div className="quest-card p-5">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Productive Work</span>
          <div className="text-3xl font-black text-purple-400 mt-1 font-display">
            {monthlyData.total_productive_hours_30d} Hours
          </div>
        </div>
      </div>

      {/* Monthly Cumulative XP Progression */}
      <div className="quest-card p-6">
        <h4 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Monthly Cumulative XP Progression
        </h4>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData.progression}>
              <defs>
                <linearGradient id="xpArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#18223c" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1322', borderColor: '#233054', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative_xp" 
                stroke="#06b6d4" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#xpArea)" 
                name="Cumulative XP" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Progression Breakdown Grid */}
      {monthlyData.skills && (
        <div className="quest-card p-6">
          <h4 className="text-base font-bold font-display text-white mb-4">
            Skill Experience Distribution
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyData.skills.map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-quest-950/70 border border-quest-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-200">{s.name}</span>
                  <span className="text-xs font-extrabold text-cyan-400">LVL {s.level}</span>
                </div>
                <div className="w-full h-1.5 bg-quest-900 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${s.progress_percentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {s.xp} Total Skill XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
