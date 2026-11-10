export type VideoCategory = 'form_tutorial' | 'hiit' | 'mobility' | 'strength' | 'nutrition';
export type VideoAccessLevel = 'free' | 'members_only' | 'premium_pt';

export interface WorkoutVideo {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  accessLevel: VideoAccessLevel;
  videoUrl: string;
  thumbnailUrl: string;
  trainerId: string;
  trainerName: string;
  viewsCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'member' | 'trainer';
  text: string;
  timestamp: string;
  isRead: boolean;
  mediaType?: 'image' | 'video' | 'voice_note';
}

export interface TrainerClientDetail {
  memberId: string;
  memberName: string;
  phone: string;
  email: string;
  plan: string;
  goal: string;
  weightStartKg: number;
  weightCurrentKg: number;
  targetWeightKg: number;
  streak: number;
  attendanceRatePct: number;
  lastWorkout: string;
  assignedRoutines: string[];
  coachNotes: Array<{
    id: string;
    date: string;
    author: string;
    note: string;
  }>;
}

export interface LiveClassSchedule {
  id: string;
  title: string;
  trainerName: string;
  date: string;
  time: string;
  durationMins: number;
  platform: 'zoom' | 'google_meet' | 'youtube_live';
  joinUrl: string;
  maxCapacity: number;
  registeredCount: number;
}
