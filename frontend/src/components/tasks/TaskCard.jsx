import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  Flame,
  Tag
} from 'lucide-react';

const PRIORITY_STYLES = {
  LOW: { label: 'Low', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  MEDIUM: { label: 'Medium', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  HIGH: { label: 'High', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  URGENT: { label: 'Urgent', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' },
};

const TaskCard = ({ 
  instance, 
  onToggleComplete, 
  onOpenTimer, 
  onEditTask, 
  onDeleteTask 
}) => {
  const task = instance.task;
  const isCompleted = instance.status === 'COMPLETED';
  const isTimerRunning = instance.is_timer_running;
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

  const actualMinutes = instance.actual_duration || 0;
  const plannedMinutes = instance.planned_duration || task.estimated_duration;
  const diffMinutes = actualMinutes > 0 ? actualMinutes - plannedMinutes : null;

  return (
    <div
      className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-quest-900/40 border-quest-850 opacity-75'
          : 'bg-quest-900/90 border-quest-800 hover:border-cyan-500/40 hover:shadow-glow-cyan'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(instance)}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-cyan-400 transition"
          title={isCompleted ? 'Mark as Incomplete' : 'Complete Quest'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-6 h-6 hover:stroke-cyan-400 stroke-slate-500" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3
              className={`text-base font-bold font-display ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${priority.badge}`}
            >
              {priority.label}
            </span>

            {/* Recurrence tag */}
            {task.recurrence !== 'ONCE' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {task.recurrence}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mb-2.5 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta badges row */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {/* Category */}
            {task.category && (
              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color,
                  border: `1px solid ${task.category.color}35`,
                }}
              >
                <Tag className="w-3 h-3" />
                <span>{task.category.name}</span>
              </div>
            )}

            {/* Skill */}
            {task.skill && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-xs">
                <span>{task.skill.name}</span>
              </div>
            )}

            {/* Time / Duration */}
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{plannedMinutes}m</span>
              {actualMinutes > 0 && (
                <span className={`text-[11px] font-bold ${diffMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  (Act: {actualMinutes}m{diffMinutes !== null && diffMinutes !== 0 ? `, ${diffMinutes > 0 ? `+${diffMinutes}` : diffMinutes}m` : ''})
                </span>
              )}
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-extrabold text-xs">
              <Zap className="w-3 h-3 fill-current" />
              <span>+{isCompleted ? instance.xp_awarded : task.xp_reward} XP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Timer Button */}
          {!isCompleted && (
            <button
              onClick={() => onOpenTimer(instance)}
              title={isTimerRunning ? 'Stopwatch is running' : 'Start Task Stopwatch'}
              className={`p-2 rounded-xl transition ${
                isTimerRunning
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan animate-pulse'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-quest-800'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Edit Button */}
          {onEditTask && (
            <button
              onClick={() => onEditTask(task)}
              title="Edit Task Definition"
              className="p-2 text-slate-400 hover:text-white hover:bg-quest-800 rounded-xl transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {onDeleteTask && (
            <button
              onClick={() => onDeleteTask(task.id)}
              title="Archive Task"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
