import React, { useState, useEffect } from 'react';
import { tasksAPI, categoriesAPI, skillsAPI } from '../services/api';
import TaskModal from '../components/tasks/TaskModal';
import { 
  Plus, 
  Search, 
  Tag, 
  Clock, 
  Zap, 
  Play, 
  Pause, 
  Edit3, 
  Trash2,
  Filter
} from 'lucide-react';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, PAUSED

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, catsRes, skillsRes] = await Promise.all([
        tasksAPI.getTasks(),
        categoriesAPI.getCategories(),
        skillsAPI.getSkillsDetail(),
      ]);
      setTasks(tasksRes.data);
      setCategories(catsRes.data);
      setSkills(skillsRes.data);
    } catch (err) {
      console.error('Failed to load tasks data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await tasksAPI.pauseTask(id);
      loadData();
    } catch (err) {
      console.error('Failed to pause task:', err);
    }
  };

  const handleResume = async (id) => {
    try {
      await tasksAPI.resumeTask(id);
      loadData();
    } catch (err) {
      console.error('Failed to resume task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this quest definition? Previously completed records will be preserved forever.')) return;
    try {
      await tasksAPI.deleteTask(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (taskToEdit) {
        await tasksAPI.updateTask(taskToEdit.id, payload);
      } else {
        await tasksAPI.createTask(payload);
      }
      loadData();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || String(t.category_id) === String(selectedCategory);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? t.is_active : !t.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-white">
            Quest Archives & Routine Definitions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure permanent quest rules, recurrences, XP bounties, and associated attributes
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-glow-cyan hover:from-cyan-400 hover:to-blue-500 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Forge New Quest</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="quest-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quest definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-quest-950 border border-quest-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-quest-950 border border-quest-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex bg-quest-950 p-0.5 rounded-xl border border-quest-800 text-xs font-bold">
            {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Paused'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div className="text-center py-16 text-cyan-400 text-xs font-bold animate-pulse">
          Opening Quest Codex...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 quest-card border-dashed">
          <p className="text-sm font-bold text-slate-300">No quest definitions match your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Create a new quest to populate this archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`quest-card p-5 flex flex-col justify-between transition ${
                !t.is_active ? 'opacity-60 bg-quest-950/80' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold font-display text-white line-clamp-1">
                    {t.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                      t.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {t.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>

                {t.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {t.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  {t.category && (
                    <span 
                      className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: `${t.category.color}15`,
                        color: t.category.color,
                        border: `1px solid ${t.category.color}35`
                      }}
                    >
                      {t.category.name}
                    </span>
                  )}
                  {t.skill && (
                    <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold">
                      {t.skill.name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-lg bg-quest-950 text-slate-400 text-xs border border-quest-800">
                    {t.estimated_duration}m
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-extrabold border border-cyan-500/30">
                    +{t.xp_reward} XP
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-quest-950 text-slate-400 text-xs border border-quest-800">
                    {t.recurrence}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-quest-800 text-xs">
                {t.is_active ? (
                  <button
                    onClick={() => handlePause(t.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={() => handleResume(t.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Resume
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setTaskToEdit(t);
                      setIsModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-white transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        taskToEdit={taskToEdit}
        skills={skills}
      />
    </div>
  );
};

export default TasksPage;
