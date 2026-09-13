import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SkillsPage from './pages/SkillsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import { Sparkles } from 'lucide-react';

function App() {
  const { user, token, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-quest-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-cyan-500 dark:text-cyan-400 font-bold animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
          <span>Entering LifeQuest Realm...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardPage onNavigateSkills={() => setActiveTab('skills')} />
      )}
      {activeTab === 'tasks' && <TasksPage />}
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'analytics' && <AnalyticsPage />}
      {activeTab === 'skills' && <SkillsPage />}
      {activeTab === 'achievements' && <AchievementsPage />}
      {activeTab === 'settings' && <SettingsPage />}
      {activeTab === 'admin' && <AdminPage />}
    </AppLayout>
  );
}

export default App;
