import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Shield, Sparkles, ArrowRight, Lock, User } from 'lucide-react';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail.trim(), password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setUsernameOrEmail('quest_hero');
    setPassword('demo123');
    setError('');
    setLoading(true);
    try {
      await login('quest_hero', 'demo123');
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-quest-950 via-quest-900 to-quest-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md bg-quest-900/90 backdrop-blur-xl border border-quest-800 rounded-3xl p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-glow-cyan">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-black font-display text-white tracking-tight">
            Life<span className="text-cyan-400">Quest</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            Gamified Productivity System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-quest-950 border border-quest-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-quest-950 border border-quest-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display uppercase tracking-wider shadow-glow-cyan transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter the Realm'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="my-6 text-center">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-quest-800"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Quick Test
            </span>
            <div className="flex-grow border-t border-quest-800"></div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 bg-quest-950 hover:bg-quest-850 border border-quest-800 text-xs font-bold text-cyan-400 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>One-Click Demo Login (quest_hero)</span>
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            New adventurer?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-cyan-400 font-bold hover:underline"
            >
              Forge an Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
