export type ClassCategory = 'all' | 'yoga' | 'zumba' | 'hiit' | 'strength';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface GymClass {
  id: string;
  name: string;
  trainerId: string;
  trainerName: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. "07:00 AM"
  endTime: string;   // e.g. "08:00 AM"
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  intensity: 'Low' | 'Moderate' | 'High';
  category: 'yoga' | 'zumba' | 'hiit' | 'strength';
  room: string;
  description: string;
  caloriesBurnEstimate: number;
}

export interface ClassBooking {
  id: string;
  classId: string;
  className: string;
  trainerName: string;
  dayOfWeek: DayOfWeek;
  timeSlot: string;
  room: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  bookedAt: string;
}
