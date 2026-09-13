import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import LevelUpModal from './LevelUpModal';
import AchievementToast from './AchievementToast';
import TaskTimerModal from '../tasks/TaskTimerModal';
import { useGame } from '../../context/GameContext';

const AppLayout = ({ activeTab, setActiveTab, children }) => {
  const { activeTimerTask, setActiveTimerTask } = useGame();
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // Re-open active timer if user clicks shortcut in header
  const handleOpenActiveTimer = () => {
    if (activeTimerTask) {
      setIsTimerModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-quest-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onOpenTimer={handleOpenActiveTimer} 
          onNavigateAdmin={() => setActiveTab('admin')} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Navigation Drawer/Bottom Bar */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* RPG Celebrations & Modals */}
      <LevelUpModal />
      <AchievementToast />

      {/* Active Timer Modal from Navbar shortcut if open */}
      {isTimerModalOpen && activeTimerTask && (
        <TaskTimerModal
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          instance={{
            id: activeTimerTask.instanceId,
            planned_duration: activeTimerTask.plannedDuration,
            task: { title: activeTimerTask.taskTitle, xp_reward: 30 },
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;
