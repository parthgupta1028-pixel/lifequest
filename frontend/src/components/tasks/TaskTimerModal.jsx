import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, X, Clock, CheckCircle2, Zap } from 'lucide-react';
import { timersAPI, instancesAPI } from '../../services/api';
import { useGame } from '../../context/GameContext';

const TaskTimerModal = ({ isOpen, onClose, instance, onTaskCompleted }) => {
  const { setActiveTimerTask } = useGame();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [plannedMin, setPlannedMin] = useState(30);
  const [actualMin, setActualMin] = useState(0);

  useEffect(() => {
    if (!instance || !isOpen) return;

    loadStatus();
  }, [instance, isOpen]);

  const loadStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await timersAPI.getStatus(instance.id);
      setSeconds(res.data.timer_seconds);
      setIsRunning(res.data.is_timer_running);
      setPlannedMin(res.data.planned_duration);
      setActualMin(res.data.actual_duration);
      if (res.data.is_timer_running) {
        setActiveTimerTask({
          instanceId: instance.id,
          taskTitle: res.data.task_title,
          plannedDuration: res.data.planned_duration,
        });
      }
    } catch (err) {
      console.error('Failed to load timer status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Local ticker when running
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = async () => {
    try {
      const res = await timersAPI.start(instance.id);
      setIsRunning(true);
      setSeconds(res.data.timer_seconds);
      setActiveTimerTask({
        instanceId: instance.id,
        taskTitle: instance.task.title,
        plannedDuration: instance.planned_duration,
      });
    } catch (err) {
      console.error('Failed to start timer:', err);
    }
  };

  const handlePause = async () => {
    try {
      const res = await timersAPI.pause(instance.id);
      setIsRunning(false);
      setSeconds(res.data.timer_seconds);
      setActualMin(res.data.actual_duration);
      setActiveTimerTask(null);
    } catch (err) {
      console.error('Failed to pause timer:', err);
    }
  };

  const handleStop = async () => {
    try {
      const res = await timersAPI.stop(instance.id);
      setIsRunning(false);
      setSeconds(res.data.timer_seconds);
      setActualMin(res.data.actual_duration);
      setActiveTimerTask(null);
    } catch (err) {
      console.error('Failed to stop timer:', err);
    }
  };

  const handleCompleteAndClose = async () => {
    if (isRunning) {
      await handleStop();
    }
    if (onTaskCompleted) {
      onTaskCompleted(instance);
    }
    onClose();
  };

  if (!isOpen || !instance) return null;

  // Format seconds to HH:MM:SS
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const formattedTime = `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const currentActualMinutes = Math.max(1, Math.round(seconds / 60));
  const diffMinutes = seconds > 0 ? currentActualMinutes - plannedMin : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-quest-900 border border-quest-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-quest-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Title */}
        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
          Focus Session & Stopwatch
        </span>
        <h3 className="text-xl font-bold font-display text-white mt-1 mb-1 truncate px-6">
          {instance.task.title}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {instance.task.category?.name || 'Quest'} • +{instance.task.xp_reward} XP Reward
        </p>

        {/* Big Stopwatch Display */}
        <div className="my-6 p-6 rounded-2xl bg-quest-950 border border-quest-800 shadow-inner">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-slate-100 mb-2">
            {formattedTime}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Planned Target: <strong className="text-slate-200">{plannedMin} min</strong></span>
          </div>
        </div>

        {/* Planned vs Actual Difference Card */}
        <div className="bg-quest-850/80 border border-quest-800 rounded-xl p-3.5 mb-6 text-xs text-slate-300 flex items-center justify-between">
          <div className="text-left">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Planned</span>
            <span className="font-bold text-slate-200">{plannedMin} min</span>
          </div>
          <div className="text-left">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Actual</span>
            <span className="font-bold text-slate-200">{currentActualMinutes} min</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Difference</span>
            <span className={`font-extrabold ${diffMinutes > 0 ? 'text-amber-400' : (diffMinutes < 0 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {diffMinutes > 0 ? `+${diffMinutes}` : diffMinutes} min
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{seconds > 0 ? 'Resume Timer' : 'Start Timer'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-gold transition"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleStop}
            disabled={seconds === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-quest-800 hover:bg-quest-700 text-slate-200 disabled:opacity-40 transition"
          >
            <Square className="w-4 h-4" />
            <span>Stop & Save</span>
          </button>
        </div>

        {/* Quick Complete Action */}
        <button
          onClick={handleCompleteAndClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 flex items-center justify-center gap-2 transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Time & Complete Quest (+{instance.task.xp_reward} XP)</span>
        </button>
      </div>
    </div>
  );
};

export default TaskTimerModal;
