import React, { useState, useEffect } from 'react';
import { X, Plus, Zap, Clock, Calendar, Check } from 'lucide-react';
import { categoriesAPI } from '../../services/api';

const XP_PRESETS = [
  { label: 'Easy', range: '10–25 XP', value: 20 },
  { label: 'Medium', range: '30–50 XP', value: 40 },
  { label: 'Hard', range: '60–100 XP', value: 75 },
];

const DAYS_OF_WEEK = [
  { id: 0, label: 'Mon' },
  { id: 1, label: 'Tue' },
  { id: 2, label: 'Wed' },
  { id: 3, label: 'Thu' },
  { id: 4, label: 'Fri' },
  { id: 5, label: 'Sat' },
  { id: 6, label: 'Sun' },
];

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, skills = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [recurrence, setRecurrence] = useState('DAILY');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri default for custom
  const [xpReward, setXpReward] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories();
      setCategories(res.data);
      if (res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.category_id || '');
      setSkillId(taskToEdit.skill_id || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setEstimatedDuration(taskToEdit.estimated_duration || 30);
      setRecurrence(taskToEdit.recurrence || 'DAILY');
      setXpReward(taskToEdit.xp_reward || 30);
      setDueDate(taskToEdit.due_date || '');
      if (taskToEdit.recurrence_days) {
        setSelectedDays(taskToEdit.recurrence_days.split(',').map(Number));
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setEstimatedDuration(30);
      setRecurrence('DAILY');
      setXpReward(30);
      setDueDate('');
      setSelectedDays([0, 1, 2, 3, 4]);
      if (skills && skills.length > 0) {
        // default to first active skill
        const active = skills.find((s) => s.is_active !== false) || skills[0];
        setSkillId(active.skill_id || active.id);
      } else {
        setSkillId('');
      }
    }
  }, [taskToEdit, skills, isOpen]);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await categoriesAPI.createCategory({ name: newCatName.trim() });
      setCategories([...categories, res.data]);
      setCategoryId(res.data.id);
      setNewCatName('');
      setShowAddCat(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId ? Number(categoryId) : null,
      skill_id: skillId ? Number(skillId) : null,
      priority,
      estimated_duration: Number(estimatedDuration),
      recurrence,
      recurrence_days: (recurrence === 'CUSTOM' || recurrence === 'WEEKLY') ? selectedDays.join(',') : null,
      xp_reward: Number(xpReward),
      due_date: dueDate || null,
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-quest-900 border border-slate-200 dark:border-quest-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-quest-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {taskToEdit ? 'Edit Quest Definition' : 'Forge New Quest'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set task parameters, XP reward bounty, and skill alignment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-quest-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Practice Python Algorithms, Study Chapter 4..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes / Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Key objectives, links, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs transition"
            />
          </div>

          {/* Category & Skill row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Custom
                </button>
              </div>

              {showAddCat ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-400 focus:outline-none transition"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.is_system ? '' : '(Custom)'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Skill */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Associated Skill
              </label>
              <select
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="">None (General XP only)</option>
                {skills && skills.map((s) => (
                  <option key={s.skill_id || s.id} value={s.skill_id || s.id}>
                    {s.name} {s.is_active === false ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="LOW">Low (Casual)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Important)</option>
                <option value="URGENT">Urgent (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Estimated Duration (min)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Recurrence Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Recurrence Pattern
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['ONCE', 'DAILY', 'WEEKLY', 'CUSTOM'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRecurrence(r)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                    recurrence === r
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500'
                      : 'bg-slate-100 dark:bg-quest-950 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-quest-800 hover:border-slate-400'
                  }`}
                >
                  {r === 'ONCE' ? 'One-time' : r}
                </button>
              ))}
            </div>

            {/* Custom / Weekly day picker */}
            {(recurrence === 'CUSTOM' || recurrence === 'WEEKLY') && (
              <div className="flex items-center justify-between gap-1.5 mt-2.5 p-2 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl">
                {DAYS_OF_WEEK.map((d) => {
                  const active = selectedDays.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        active
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                          : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-quest-850'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* XP Reward Config */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                XP Reward Bounty
              </label>
              <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                +{xpReward} XP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              {XP_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setXpReward(preset.value)}
                  className={`p-2 rounded-xl border text-left transition ${
                    xpReward === preset.value
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-400'
                      : 'bg-slate-100 dark:bg-quest-950 border-slate-300 dark:border-quest-800 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] text-slate-400">{preset.range}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">
                {xpReward} XP
              </span>
            </div>
          </div>

          {/* Due date if one-time */}
          {recurrence === 'ONCE' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display uppercase tracking-wider shadow-md transition"
            >
              {taskToEdit ? 'Update Quest Definition' : 'Forge Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
