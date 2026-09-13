import React from 'react';
import CalendarView from '../components/calendar/CalendarView';
import { Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage = () => {
  return (
    <div className="space-y-6 pb-16 md:pb-8">
      <div>
        <h2 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-cyan-400" />
          Chronicle Calendar & Rest Days
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect past achievements, plan ahead, and designate Rest Days to protect your active streak
        </p>
      </div>

      <CalendarView />
    </div>
  );
};

export default CalendarPage;
