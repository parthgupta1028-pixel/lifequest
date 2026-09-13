import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [levelUpData, setLevelUpData] = useState(null);
  const [activeAchievement, setActiveAchievement] = useState(null);
  const [activeTimerTask, setActiveTimerTask] = useState(null); // { instanceId, taskTitle, plannedDuration }
  const [soundEnabled, setSoundEnabled] = useState(true);

  const triggerLevelUp = (payload) => {
    setLevelUpData(payload);
    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899']
    });
  };

  const closeLevelUp = () => {
    setLevelUpData(null);
  };

  const triggerAchievement = (achievement) => {
    setActiveAchievement(achievement);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a']
    });
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setActiveAchievement((prev) => (prev?.id === achievement.id ? null : prev));
    }, 6000);
  };

  const closeAchievement = () => {
    setActiveAchievement(null);
  };

  return (
    <GameContext.Provider
      value={{
        levelUpData,
        triggerLevelUp,
        closeLevelUp,
        activeAchievement,
        triggerAchievement,
        closeAchievement,
        activeTimerTask,
        setActiveTimerTask,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
