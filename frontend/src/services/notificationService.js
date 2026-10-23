import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

export const NotificationService = {
  async requestPermission() {
    try {
      if (isCapacitor()) {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } else if ('Notification' in window) {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
    return false;
  },

  async scheduleDailyReminders(currentStreak = 0) {
    try {
      if (isCapacitor()) {
        await LocalNotifications.cancel({ notifications: [{ id: 101 }, { id: 102 }] });
        
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 101,
              title: '⚔️ LifeQuest: New Daily Quests!',
              body: 'Your daily tasks are ready. Complete them today to earn XP and level up!',
              schedule: { on: { hour: 9, minute: 0 }, repeats: true }
            },
            {
              id: 102,
              title: '🔥 Streak in Danger!',
              body: currentStreak > 0 
                ? `Don't break your ${currentStreak}-day streak! Complete a quest or mark a rest day before midnight.`
                : 'Complete a quest tonight to start your productivity streak!',
              schedule: { on: { hour: 20, minute: 0 }, repeats: true }
            }
          ]
        });
      }
    } catch (e) {
      console.warn('Error scheduling mobile reminders:', e);
    }
  },

  async sendImmediateNotification(title, body) {
    try {
      if (isCapacitor()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 500) }
            }
          ]
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.warn('Error showing notification:', e);
    }
  },

  async triggerHapticFeedback() {
    try {
      if (isCapacitor()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
    } catch (e) {
      // Haptics not available in standard webview
    }
  }
};
