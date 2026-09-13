import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  ShieldCheck 
} from 'lucide-react';

const Navbar = ({ onOpenTimer, onNavigateAdmin }) => {
  const { user } = useAuth();
  const { activeTimerTask, soundEnabled, setSoundEnabled } = useGame();
  const { theme, toggleTheme } = useTheme();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white/80 dark:bg-quest-900/80 backdrop-blur-md border-b border-slate-200 dark:border-quest-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Date & Title */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Current Cycle
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {todayFormatted}
          </h2>
        </div>
        <div className="sm:hidden font-display font-extrabold text-cyan-600 dark:text-cyan-400 text-lg">
          LifeQuest
        </div>

        {/* Admin Quick Pill if user is admin */}
        {user?.role === 'admin' && onNavigateAdmin && (
          <button
            onClick={onNavigateAdmin}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full hover:bg-purple-500/20 transition"
            title="Open Admin Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* Stats and Theme toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Timer Pill if running */}
        {activeTimerTask && (
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 text-xs font-bold rounded-full animate-pulse hover:bg-cyan-500/20 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline truncate max-w-[100px]">{activeTimerTask.taskTitle}</span>
            <span className="text-[11px]">Timer Active</span>
          </button>
        )}

        {/* Streak Pill */}
        {user && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-current" />
            <span>{user.current_streak}d Streak</span>
          </div>
        )}

        {/* Level / XP Pill */}
        {user && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-quest-800 border border-slate-200 dark:border-quest-700 text-xs font-bold">
            <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">LVL {user.level}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-700 dark:text-slate-200">{user.total_xp.toLocaleString()} XP</span>
          </div>
        )}

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-cyan-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-quest-800 rounded-xl transition-all duration-200 active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Game Audio Enabled' : 'Game Audio Muted'}
          className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-quest-800 rounded-xl transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
