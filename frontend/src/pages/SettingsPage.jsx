import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, restDaysAPI } from '../services/api';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Trash2, 
  User, 
  ShieldCheck, 
  Palette, 
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const { soundEnabled, setSoundEnabled } = useGame();
  const { theme, setTheme } = useTheme();
  const [restDays, setRestDays] = useState([]);
  const [loadingRest, setLoadingRest] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    loadRestDays();
  }, []);

  const loadRestDays = async () => {
    try {
      setLoadingRest(true);
      const res = await restDaysAPI.getRestDays();
      setRestDays(res.data);
    } catch (err) {
      console.error('Failed to load rest days:', err);
    } finally {
      setLoadingRest(false);
    }
  };

  const handleRemoveRestDay = async (dateStr) => {
    try {
      await restDaysAPI.removeRestDay(dateStr);
      loadRestDays();
    } catch (err) {
      console.error('Failed to remove rest day:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16 md:pb-8">
      <div>
        <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Settings & Hero Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust visual themes, audio feedback, account profile, and designated Rest Days
        </p>
      </div>

      {/* Visual Appearance & Theme Card */}
      <div className="quest-card p-6">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-500" />
          Interface Appearance (Light / Dark Mode)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose your visual realm theme. Your selection is automatically saved in local storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              theme === 'dark'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-900 text-white shadow-md'
                : 'border-slate-200 dark:border-quest-800 bg-slate-900/60 text-slate-400 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Cyber RPG Dark</div>
                <div className="text-[11px] text-slate-400">Glowing neon accents and dark slate armor</div>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              theme === 'light'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white text-slate-900 shadow-md'
                : 'border-slate-200 dark:border-quest-800 bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Modern Crisp Light</div>
                <div className="text-[11px] text-slate-500">Clean white cards and high-contrast typography</div>
              </div>
            </div>
            {theme === 'light' && (
              <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="quest-card p-6">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-500" />
          Character Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-200 dark:border-quest-800">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Username</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user?.username}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-200 dark:border-quest-800">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Email Address</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user?.email}</span>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-200 dark:border-quest-800">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Rank & Role</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">Level {user?.level}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-200 dark:border-quest-800">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Accumulated XP</span>
            <span className="font-bold text-amber-500 text-sm">{user?.total_xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Audio Preferences */}
      <div className="quest-card p-6">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          Game Sound Effects
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Toggles celebratory audio fanfare for quest completions, level-ups, and achievements.
        </p>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            soundEnabled
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'bg-slate-200 dark:bg-quest-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          {soundEnabled ? 'Audio Enabled' : 'Audio Muted'}
        </button>
      </div>

      {/* Rest Days Manager */}
      <div className="quest-card p-6">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Moon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          Rest Days Management
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Rest Days shield your streak from breaking during planned rest intervals. Review or remove logged rest days below.
        </p>

        {loadingRest ? (
          <span className="text-xs text-slate-400 animate-pulse">Loading rest days...</span>
        ) : restDays.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No Rest Days recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {restDays.map((rd) => (
              <div
                key={rd.id}
                className="p-3 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-200 dark:border-quest-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {new Date(rd.rest_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400">
                    {rd.note || 'Rest & Recovery'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRestDay(rd.rest_date)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                  title="Remove Rest Day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="quest-card p-6 border-rose-500/30 bg-rose-500/5">
        <h3 className="text-base font-bold font-display text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Reset Game Progress (Fresh Start)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Want a completely clean start? Reset your Total XP back to 0, Level to 1, Streaks to 0, and clear all completed tasks. Your custom skill definitions and account will remain safe.
        </p>

        {resetMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 font-semibold">
            {resetMessage}
          </div>
        )}

        <button
          onClick={async () => {
            if (window.confirm("⚠️ ARE YOU SURE?\n\nThis will permanently reset your Total XP to 0, Level to 1, Streaks to 0, and clear your completed tasks list!")) {
              try {
                setResetting(true);
                setResetMessage('');
                await authAPI.resetMyProgress();
                await refreshUser();
                setResetMessage('All progress successfully reset! You are now Level 1 with 0 XP.');
              } catch (err) {
                alert(err.response?.data?.detail || 'Failed to reset progress.');
              } finally {
                setResetting(false);
              }
            }
          }}
          disabled={resetting}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting Progress...' : 'Reset My Progress to Level 1 (0 XP)'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
