import React, { useState, useEffect } from 'react';
import { dashboardAPI, instancesAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import HeroLevelCard from '../components/dashboard/HeroLevelCard';
import StreakCard from '../components/dashboard/StreakCard';
import ProductivityScoreCard from '../components/dashboard/ProductivityScoreCard';
import QuickStatsRow from '../components/dashboard/QuickStatsRow';
import SkillHexagonRadar from '../components/dashboard/SkillHexagonRadar';
import DailyMissionCard from '../components/dashboard/DailyMissionCard';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskTimerModal from '../components/tasks/TaskTimerModal';
import { Plus, ListFilter, Sparkles, CheckCircle2 } from 'lucide-react';

const DashboardPage = ({ onNavigateSkills }) => {
  const { user, refreshUser } = useAuth();
  const { triggerLevelUp, triggerAchievement } = useGame();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeTimerInstance, setActiveTimerInstance] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (instance) => {
    try {
      if (instance.status === 'COMPLETED') {
        await instancesAPI.uncompleteInstance(instance.id);
      } else {
        const res = await instancesAPI.completeInstance(instance.id);
        if (res.data.did_level_up) {
          triggerLevelUp({
            new_level: res.data.new_level,
            previous_level: res.data.previous_level,
            new_total_xp: res.data.new_total_xp,
          });
        }
        if (res.data.unlocked_achievements && res.data.unlocked_achievements.length > 0) {
          res.data.unlocked_achievements.forEach((ach) => triggerAchievement(ach));
        }
      }
      await refreshUser();
      loadDashboard();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleSaveTask = async (taskPayload) => {
    try {
      if (taskToEdit) {
        await tasksAPI.updateTask(taskToEdit.id, taskPayload);
      } else {
        await tasksAPI.createTask(taskPayload);
      }
      loadDashboard();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      loadDashboard();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-cyan-400 font-bold animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
          <span>Summoning LifeQuest Telemetry...</span>
        </div>
      </div>
    );
  }

  const tasks = dashboardData?.today_tasks || [];
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* 1. Hero Level & XP Banner */}
      <HeroLevelCard user={dashboardData?.user || user} />

      {/* 2. Quick 4-Card Stats Row */}
      <QuickStatsRow quickStats={dashboardData?.quick_stats} />

      {/* 3. Core Progression Grid: Streak & Productivity Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakCard 
          streakInfo={dashboardData?.streak} 
          onRestDayToggled={loadDashboard} 
        />
        <ProductivityScoreCard 
          scoreData={dashboardData?.productivity} 
        />
      </div>

      {/* 4. Hexagon Skill Radar & Daily Mission Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillHexagonRadar 
          radarData={dashboardData?.skills_radar} 
          onNavigateSkills={onNavigateSkills}
        />
        <DailyMissionCard 
          mission={dashboardData?.daily_mission} 
          onMissionClaimed={loadDashboard}
        />
      </div>

      {/* 5. Today's Quest Board */}
      <div className="quest-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              Today's Quest Objectives
            </h3>
            <span className="text-xs text-slate-400">
              Complete tasks to earn character XP, power attributes, and maintain your streak
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter pills */}
            <div className="flex bg-quest-950 p-1 rounded-xl border border-quest-800 text-xs font-bold">
              {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg transition ${
                    filter === f
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'PENDING' ? 'Pending' : 'Completed'}
                </button>
              ))}
            </div>

            {/* Forge Quest Button */}
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-glow-cyan hover:from-cyan-400 hover:to-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Forge Quest</span>
            </button>
          </div>
        </div>

        {/* Tasks list */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-quest-800 rounded-2xl bg-quest-950/40">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
            <p className="text-sm font-bold text-slate-300">
              {filter === 'COMPLETED' ? 'No completed quests yet today.' : 'No pending quests! Your scroll is clear.'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Forge a new quest to begin earning experience points.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTasks.map((instance) => (
              <TaskCard
                key={instance.id}
                instance={instance}
                onToggleComplete={handleToggleComplete}
                onOpenTimer={(inst) => setActiveTimerInstance(inst)}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        skills={dashboardData?.skills_radar}
      />

      {/* Live Stopwatch Modal */}
      <TaskTimerModal
        isOpen={!!activeTimerInstance}
        onClose={() => setActiveTimerInstance(null)}
        instance={activeTimerInstance}
        onTaskCompleted={handleToggleComplete}
      />
    </div>
  );
};

export default DashboardPage;
