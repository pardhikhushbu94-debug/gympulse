export type UserRole = 'member' | 'trainer' | 'admin';

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  heightCm?: number;
  weightKg?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal?: 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness' | 'endurance';
  limitations?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  assignedTrainerId?: string;
  createdAt: string;
}

export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'frozen';

export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  durationDays: number;
  basePriceINR: number;
  appDiscountPriceINR: number;
  description: string;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  daysRemaining: number;
  amountPaidINR: number;
  isAutoRenew: boolean;
  freezeDaysRemaining: number;
  isFrozen: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkInTime: string;
  checkOutTime?: string;
  method: 'qr_scan' | 'desk_scan' | 'manual_override';
  status: 'active_in_gym' | 'completed';
  streakCount: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  commonMistakes: string[];
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscle: string;
  exercisesCount: number;
  createdBy: 'admin' | 'trainer' | 'member';
  trainerName?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  membershipId: string;
  planName: string;
  amountINR: number;
  gstAmountINR: number;
  method: 'upi' | 'card' | 'netbanking' | 'cash';
  status: 'captured' | 'failed' | 'refunded';
  invoiceNumber: string;
  createdAt: string;
}
