import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationService } from '../../services/notificationService';
import { 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  ShieldCheck,
  Bell,
  BellRing,
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const Navbar = ({ onOpenTimer, onNavigateAdmin }) => {
  const { user } = useAuth();
  const { activeTimerTask, soundEnabled, setSoundEnabled } = useGame();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasPermission, setHasPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Schedule mobile reminders if on Capacitor
    if (user) {
      NotificationService.scheduleDailyReminders(user.current_streak);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnableWebPush = async () => {
    const granted = await NotificationService.requestPermission();
    setHasPermission(granted);
    if (granted) {
      NotificationService.sendImmediateNotification(
        '🔔 Notifications Enabled!',
        'You will now receive daily quest and streak protection alerts.'
      );
    }
  };

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

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Reminders"
            className="relative p-2 text-slate-500 hover:text-cyan-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-quest-800 rounded-xl transition-all duration-200"
          >
            {user?.current_streak > 0 ? (
              <BellRing className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {/* Unread badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-quest-900" />
          </button>

          {/* Floating Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-quest-900 border border-slate-200 dark:border-quest-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-quest-800">
                <div className="flex items-center gap-1.5 font-bold font-display text-slate-800 dark:text-slate-200">
                  <Bell className="w-4 h-4 text-cyan-500" />
                  <span>Notifications & Reminders</span>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>

              {/* Web Push Permission Banner if not granted */}
              {!hasPermission && (
                <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-bold block text-cyan-600 dark:text-cyan-400">Enable Desktop Popups</span>
                    Get reminders even with the browser minimized
                  </div>
                  <button
                    onClick={handleEnableWebPush}
                    className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[10px] transition flex-shrink-0"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {user?.current_streak > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Streak Protection Active
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Your {user.current_streak}-day streak needs daily progress before midnight.
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-100 dark:border-quest-800 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Daily Quests Ready
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Complete today's missions to earn XP and level up your skills.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-quest-950 rounded-xl border border-slate-100 dark:border-quest-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Cross-Platform Sync
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Reminders are synced across both this Web app and the Android mobile APK!
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Button Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-quest-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    NotificationService.sendImmediateNotification(
                      '⚔️ LifeQuest Quest Alert!',
                      'Hero! Your daily streak and quests are waiting for you.'
                    );
                  }}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  Send Test Alert
                </button>
                <span className="text-[10px] text-slate-400">
                  9:00 AM & 8:00 PM Daily
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
