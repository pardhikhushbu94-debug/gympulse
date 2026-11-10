import { create } from 'zustand';
import {
  DietType,
  BodyMeasurement,
  AppNotification,
  NotificationPreferences,
} from '../types/nutritionAndGoals';
import { initialNotifications, initialMeasurements } from '../services/nutritionService';

interface NutritionGoalsState {
  dietType: DietType;
  waterGlasses: number;
  waterTargetGlasses: number;
  measurements: BodyMeasurement[];
  notifications: AppNotification[];
  preferences: NotificationPreferences;

  // Actions
  setDietType: (type: DietType) => void;
  incrementWater: () => void;
  decrementWater: () => void;
  resetWater: () => void;
  logMeasurement: (entry: BodyMeasurement) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
}

export const useNutritionStore = create<NutritionGoalsState>((set) => ({
  dietType: 'veg',
  waterGlasses: 6, // 6 glasses already today (2.4 L)
  waterTargetGlasses: 8, // 8 glasses = 3.2 L
  measurements: initialMeasurements,
  notifications: initialNotifications,
  preferences: {
    pushEnabled: true,
    workoutReminderTime: '06:30 AM',
    waterReminderIntervalHours: 2,
    membershipExpiryAlerts: true,
    trainerMessageAlerts: true,
    quietHoursEnabled: true,
    quietHoursStart: '10:00 PM',
    quietHoursEnd: '07:00 AM',
  },

  setDietType: (dietType: DietType) => set({ dietType }),

  incrementWater: () =>
    set((state) => ({
      waterGlasses: Math.min(16, state.waterGlasses + 1),
    })),

  decrementWater: () =>
    set((state) => ({
      waterGlasses: Math.max(0, state.waterGlasses - 1),
    })),

  resetWater: () => set({ waterGlasses: 0 }),

  logMeasurement: (entry: BodyMeasurement) =>
    set((state) => ({
      measurements: [entry, ...state.measurements],
    })),

  markNotificationAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  updatePreferences: (updates: Partial<NotificationPreferences>) =>
    set((state) => ({
      preferences: { ...state.preferences, ...updates },
    })),
}));
