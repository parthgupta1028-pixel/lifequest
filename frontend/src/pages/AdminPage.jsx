import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Award, 
  Clock, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw,
  Flame,
  Layers
} from 'lucide-react';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (query = searchQuery) => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ search: query || undefined, limit: 100 }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleToggleActive = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert("You cannot deactivate your own administrative account.");
      return;
    }

    const actionName = targetUser.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionName} user '${targetUser.username}'?`)) return;

    try {
      const res = await adminAPI.toggleUserActive(targetUser.id);
      showNotification(res.data.message);
      loadData();
    } catch (err) {
      console.error('Failed to toggle user active status:', err);
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleUpdateRole = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert("You cannot demote your own administrative role.");
      return;
    }

    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = nextRole === 'admin'
      ? `Promote '${targetUser.username}' to Administrator? They will have full system telemetry and moderation rights.`
      : `Demote '${targetUser.username}' to standard User?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminAPI.updateUserRole(targetUser.id, { role: nextRole });
      showNotification(res.data.message);
      loadData();
    } catch (err) {
      console.error('Failed to update role:', err);
      alert(err.response?.data?.detail || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-cyan-500" />
            System Administration & Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global system health, user analytics, access controls, and moderation
          </p>
        </div>

        <button
          onClick={() => loadData(searchQuery)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-quest-800 hover:bg-slate-200 dark:hover:bg-quest-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Action Notification Banner */}
      {notification && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Telemetry KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="quest-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Users
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {stats.total_users}
                </span>
                <span className="text-[11px] text-emerald-500 font-bold">
                  ({stats.active_users} active)
                </span>
              </div>
            </div>
          </div>

          {/* Tasks & Completion */}
          <div className="quest-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tasks Completed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {stats.completed_tasks}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  / {stats.total_tasks} created
                </span>
              </div>
            </div>
          </div>

          {/* Total XP Generated */}
          <div className="quest-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total XP Bounty
              </span>
              <span className="text-xl font-black font-display text-slate-900 dark:text-white">
                {stats.total_xp_generated.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Productive Hours & Skills */}
          <div className="quest-card p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Productive Hours
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-display text-slate-900 dark:text-white">
                  {stats.total_productive_hours}h
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({stats.total_skills_created} skills)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="quest-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-quest-800">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              User Directory & Moderation
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Search, promote to admin, or toggle account access
            </span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-quest-950 border border-slate-300 dark:border-quest-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-quest-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Level & XP</th>
                <th className="pb-3 px-3">Streak</th>
                <th className="pb-3 px-3">Tasks</th>
                <th className="pb-3 px-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-quest-850">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-quest-850/50 transition">
                    {/* User Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                          {u.username.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-cyan-500/10 text-cyan-500 font-extrabold px-1.5 py-0.2 rounded border border-cyan-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          : 'bg-slate-200 dark:bg-quest-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase tracking-wider ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Level & XP */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        LVL {u.level}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {u.total_xp.toLocaleString()} XP
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{u.current_streak}d</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Best: {u.best_streak}d</span>
                    </td>

                    {/* Tasks */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {u.completed_tasks_count} done
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {u.tasks_count} total quests
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Role */}
                        <button
                          disabled={isSelf}
                          onClick={() => handleUpdateRole(u)}
                          title={isSelf ? "Cannot demote yourself" : u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                            isSelf
                              ? 'opacity-40 cursor-not-allowed border-slate-300 dark:border-quest-800 text-slate-400'
                              : u.role === 'admin'
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                              : 'bg-slate-100 dark:bg-quest-800 border-slate-200 dark:border-quest-700 text-slate-600 dark:text-slate-300 hover:border-purple-500'
                          }`}
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>

                        {/* Toggle Active */}
                        <button
                          disabled={isSelf}
                          onClick={() => handleToggleActive(u)}
                          title={isSelf ? "Cannot deactivate yourself" : u.is_active ? 'Deactivate Account' : 'Activate Account'}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                            isSelf
                              ? 'opacity-40 cursor-not-allowed border-slate-300 dark:border-quest-800 text-slate-400'
                              : u.is_active
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
