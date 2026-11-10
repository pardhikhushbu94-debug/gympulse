export type DietType = 'veg' | 'non_veg' | 'egg_itarian';

export interface MealItem {
  mealTime: 'Breakfast' | 'Mid-Morning' | 'Lunch' | 'Evening Snack' | 'Dinner';
  title: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  indianFoods: string[];
}

export interface NutritionPlan {
  id: string;
  title: string;
  dietType: DietType;
  caloriesTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  description: string;
  meals: MealItem[];
}

export interface BodyMeasurement {
  date: string;
  weightKg: number;
  chestInches: number;
  armsInches: number;
  waistInches: number;
  thighsInches: number;
  bodyFatPct: number;
}

export interface FitnessProgram {
  id: string;
  title: string;
  subtitle: string;
  durationWeeks: number;
  weeklyWorkoutsCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetGoal: string;
  isPremium: boolean;
  coverImageUrl: string;
  trainerName: string;
  scheduleOverview: Array<{
    week: number;
    focus: string;
    description: string;
  }>;
}

export interface AppNotification {
  id: string;
  type: 'expiry' | 'trainer' | 'streak' | 'workout_reminder' | 'payment' | 'broadcast';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  workoutReminderTime: string;
  waterReminderIntervalHours: number;
  membershipExpiryAlerts: boolean;
  trainerMessageAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
