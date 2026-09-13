import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Moon, 
  Zap, 
  Clock 
} from 'lucide-react';
import { instancesAPI, restDaysAPI } from '../../services/api';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [selectedInstances, setSelectedInstances] = useState([]);
  const [restDaysMap, setRestDaysMap] = useState({});
  const [loadingTasks, setLoadingTasks] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadRestDays();
  }, [year, month]);

  useEffect(() => {
    if (selectedDateStr) {
      loadDateInstances(selectedDateStr);
    }
  }, [selectedDateStr]);

  const loadRestDays = async () => {
    try {
      const res = await restDaysAPI.getRestDays();
      const map = {};
      res.data.forEach((r) => {
        map[r.rest_date] = r;
      });
      setRestDaysMap(map);
    } catch (err) {
      console.error('Failed to load rest days:', err);
    }
  };

  const loadDateInstances = async (dateStr) => {
    try {
      setLoadingTasks(true);
      const res = await instancesAPI.getInstancesForDate(dateStr);
      setSelectedInstances(res.data);
    } catch (err) {
      console.error('Failed to load date tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleToggleRestDay = async () => {
    try {
      if (restDaysMap[selectedDateStr]) {
        await restDaysAPI.removeRestDay(selectedDateStr);
        const copy = { ...restDaysMap };
        delete copy[selectedDateStr];
        setRestDaysMap(copy);
      } else {
        const res = await restDaysAPI.addRestDay({ rest_date: selectedDateStr, note: 'Calendar Rest Day' });
        setRestDaysMap({ ...restDaysMap, [selectedDateStr]: res.data });
      }
    } catch (err) {
      console.error('Failed to toggle rest day:', err);
    }
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({ day: d, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const monthFormatted = (month + 1).toString().padStart(2, '0');
    const dayFormatted = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
    calendarDays.push({ 
      day: d, 
      isCurrentMonth: true, 
      dateStr,
      isRestDay: !!restDaysMap[dateStr],
      isToday: dateStr === new Date().toISOString().split('T')[0],
      isSelected: dateStr === selectedDateStr,
    });
  }

  const isSelectedDateRest = !!restDaysMap[selectedDateStr];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (2 Cols) */}
      <div className="lg:col-span-2 quest-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              {monthNames[month]} {year}
            </h3>
            <span className="text-xs text-slate-400">
              Select date to review quests, track completions, or allocate rest days
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-quest-950 border border-quest-800 hover:bg-quest-850 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-quest-950 border border-quest-800 hover:bg-quest-850 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Month dates */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return (
                <div
                  key={idx}
                  className="h-20 p-2 rounded-xl bg-quest-950/20 border border-quest-850/30 text-slate-700 text-xs font-semibold"
                >
                  {item.day}
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`h-20 p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  item.isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-glow-cyan'
                    : 'bg-quest-950/60 border-quest-850 hover:border-slate-700'
                } ${item.isToday ? 'ring-1 ring-amber-400/80' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      item.isToday
                        ? 'text-amber-400 font-extrabold'
                        : item.isSelected
                        ? 'text-cyan-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.day}
                  </span>

                  {item.isRestDay && (
                    <Moon className="w-3.5 h-3.5 text-purple-400" title="Rest Day" />
                  )}
                </div>

                <div className="text-[10px] text-slate-400">
                  {item.isToday && (
                    <span className="text-[9px] font-bold uppercase text-amber-400">Today</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Quests Side Panel (1 Col) */}
      <div className="quest-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-quest-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Selected Chronicle
              </span>
              <h4 className="text-lg font-bold font-display text-white">
                {new Date(selectedDateStr).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h4>
            </div>

            <button
              onClick={handleToggleRestDay}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isSelectedDateRest
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-quest-950 text-slate-400 hover:text-white border-quest-800'
              }`}
              title={isSelectedDateRest ? 'Remove Rest Day' : 'Mark as Rest Day'}
            >
              <Moon className="w-4 h-4 text-purple-400" />
              <span>{isSelectedDateRest ? 'Rest Day' : 'Set Rest'}</span>
            </button>
          </div>

          {/* Quests on this date */}
          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
            {loadingTasks ? (
              <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                Consulting the archives...
              </div>
            ) : selectedInstances.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No tasks logged on this date.</p>
              </div>
            ) : (
              selectedInstances.map((inst) => (
                <div
                  key={inst.id}
                  className={`p-3 rounded-xl border ${
                    inst.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-quest-950/70 border-quest-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5
                      className={`text-xs font-bold ${
                        inst.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {inst.task.title}
                    </h5>
                    {inst.status === 'COMPLETED' ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-quest-900">
                    <span>{inst.task.category?.name || 'Quest'}</span>
                    <span className="text-cyan-400 font-bold">
                      +{inst.status === 'COMPLETED' ? inst.xp_awarded : inst.task.xp_reward} XP
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
