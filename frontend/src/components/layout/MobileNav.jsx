import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Hexagon, 
  Trophy,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_MOBILE_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'skills', label: 'Skills', icon: Hexagon },
  { id: 'achievements', label: 'Badges', icon: Trophy },
];

const MobileNav = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const items = [...BASE_MOBILE_ITEMS];
  if (user?.role === 'admin') {
    items.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-quest-900/95 backdrop-blur-md border-t border-slate-200 dark:border-quest-800 px-1 py-1.5 flex justify-around items-center transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isAdmin = item.id === 'admin';
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
              isActive 
                ? isAdmin ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-cyan-600 dark:text-cyan-400 font-bold' 
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${
              isActive 
                ? isAdmin ? 'text-purple-600 dark:text-purple-400 stroke-[2.5]' : 'text-cyan-600 dark:text-cyan-400 stroke-[2.5]' 
                : 'text-slate-400'
            }`} />
            <span className="text-[9px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
