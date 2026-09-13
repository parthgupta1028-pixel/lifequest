import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Hexagon, 
  Trophy, 
  Settings, 
  LogOut, 
  Flame, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'skills', label: 'Skills & Polygon', icon: Hexagon },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [...BASE_NAV_ITEMS];
  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-quest-900 border-r border-slate-200 dark:border-quest-800 shrink-0 h-screen sticky top-0 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-quest-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
          <Zap className="w-6 h-6 text-slate-950 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-1.5">
            Life<span className="text-cyan-500">Quest</span>
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Gamified Productivity
          </span>
        </div>
      </div>

      {/* User Hero Mini-Badge */}
      {user && (
        <div className="mx-4 my-4 p-3 bg-slate-50 dark:bg-quest-850/80 border border-slate-200 dark:border-quest-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 truncate max-w-[120px]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate">
                {user.username}
              </span>
              {user.role === 'admin' && (
                <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold px-1 rounded border border-purple-500/30">
                  ADM
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold">
              <Flame className="w-3.5 h-3.5 fill-current" /> {user.current_streak}d
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">LVL {user.level}</span>
            <span>{user.total_xp.toLocaleString()} XP</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-quest-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${user.level_progress?.progress_percentage || 20}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdminItem = item.id === 'admin';
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? isAdminItem
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-semibold'
                    : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-quest-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isActive 
                  ? isAdminItem ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400' 
                  : isAdminItem ? 'text-purple-500' : 'text-slate-400'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-quest-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit LifeQuest</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
