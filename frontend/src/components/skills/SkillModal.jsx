import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Code, 
  BookOpen, 
  Activity, 
  Target, 
  Compass, 
  Clock, 
  Flame, 
  Trophy, 
  Brain, 
  Heart, 
  Sparkles, 
  Music, 
  Shield 
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'zap', label: 'Energy', icon: Zap },
  { id: 'code', label: 'Coding', icon: Code },
  { id: 'book-open', label: 'Study', icon: BookOpen },
  { id: 'activity', label: 'Fitness', icon: Activity },
  { id: 'target', label: 'Focus', icon: Target },
  { id: 'compass', label: 'Explore', icon: Compass },
  { id: 'clock', label: 'Time', icon: Clock },
  { id: 'flame', label: 'Streak', icon: Flame },
  { id: 'trophy', label: 'Mastery', icon: Trophy },
  { id: 'brain', label: 'Cognition', icon: Brain },
  { id: 'heart', label: 'Health', icon: Heart },
  { id: 'sparkles', label: 'Magic', icon: Sparkles },
  { id: 'music', label: 'Art', icon: Music },
  { id: 'shield', label: 'Defense', icon: Shield },
];

export const COLOR_PALETTE = [
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Rose', hex: '#f43f5e' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Orange', hex: '#f97316' },
];

const SkillModal = ({ isOpen, onClose, onSave, skillToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [icon, setIcon] = useState('zap');
  const [error, setError] = useState('');

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name || '');
      setDescription(skillToEdit.description || '');
      setColor(skillToEdit.color || '#06b6d4');
      setIcon(skillToEdit.icon || 'zap');
    } else {
      setName('');
      setDescription('');
      setColor('#06b6d4');
      setIcon('zap');
    }
    setError('');
  }, [skillToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Skill name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
    });
    onClose();
  };

  const SelectedIconComp = AVAILABLE_ICONS.find((i) => i.id === icon)?.icon || Zap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-quest-900 border border-slate-200 dark:border-quest-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-quest-800">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition"
              style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
            >
              <SelectedIconComp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                {skillToEdit ? 'Modify Attribute' : 'Forge Custom Skill'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define your personalized productivity attribute
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-quest-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="e.g. DSA, Guitar, Communication, Reading..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="What quests contribute to this attribute?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-xs transition"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Attribute Color Glow
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`h-8 rounded-xl flex items-center justify-center transition border ${
                    color === c.hex
                      ? 'scale-105 ring-2 ring-offset-2 ring-cyan-400 border-white dark:border-slate-900'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Icon Symbol
            </label>
            <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-100 dark:bg-quest-950 border border-slate-200 dark:border-quest-800 rounded-xl">
              {AVAILABLE_ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIcon(item.id)}
                    title={item.label}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-quest-800'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold border border-slate-300 dark:border-quest-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-quest-800 text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display text-xs uppercase tracking-wider shadow-md transition"
            >
              {skillToEdit ? 'Save Changes' : 'Create Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
