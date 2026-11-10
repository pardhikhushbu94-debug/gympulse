import { UserProfile, UserMembership, AttendanceRecord } from '../types';

export interface GymLocation {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export const GYM_LOCATION: GymLocation = {
  name: 'IronCore Fitness, Andheri West, Mumbai',
  latitude: 19.136326,
  longitude: 72.82766,
  radiusMeters: 50, // 50m geofence radius
};

export interface CheckInResult {
  success: boolean;
  message: string;
  errorType?: 'expired_membership' | 'frozen_membership' | 'geofence_failed' | 'invalid_token' | 'already_checked_in';
  record?: AttendanceRecord;
  newStreak?: number;
}

export interface LiveHeadcountMember {
  id: string;
  userId: string;
  name: string;
  plan: string;
  avatarUrl?: string;
  checkInTime: string;
  elapsedMinutes: number;
  method: 'qr_scan' | 'desk_scan' | 'manual_override';
}

export interface AbsenteeMember {
  userId: string;
  name: string;
  phone: string;
  plan: string;
  daysAbsent: number;
  lastVisitDate: string;
  assignedTrainer: string;
  streakLost: number;
}

// In-memory live attendance state
let liveFloorMembers: LiveHeadcountMember[] = [
  {
    id: 'att_live_1',
    userId: 'usr_member_101',
    name: 'Rajesh Kumar',
    plan: '6M Gold',
    checkInTime: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    elapsedMinutes: 42,
    method: 'qr_scan',
  },
  {
    id: 'att_live_2',
    userId: 'usr_member_103',
    name: 'Sneha Deshmukh',
    plan: '12M Platinum',
    checkInTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    elapsedMinutes: 25,
    method: 'desk_scan',
  },
  {
    id: 'att_live_3',
    userId: 'usr_member_104',
    name: 'Karan Mehra',
    plan: '3M Silver',
    checkInTime: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    elapsedMinutes: 68,
    method: 'qr_scan',
  },
  {
    id: 'att_live_4',
    userId: 'usr_member_105',
    name: 'Pooja Nair',
    plan: '6M Gold',
    checkInTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    elapsedMinutes: 15,
    method: 'qr_scan',
  },
];

export const mockAbsentees: AbsenteeMember[] = [
  {
    userId: 'usr_abs_1',
    name: 'Rohan Sharma',
    phone: '+91 98200 11223',
    plan: '3 Months Silver',
    daysAbsent: 5,
    lastVisitDate: 'Nov 04, 2026',
    assignedTrainer: 'Coach Vikram Sharma',
    streakLost: 8,
  },
  {
    userId: 'usr_abs_2',
    name: 'Deepak Varma',
    phone: '+91 98200 44556',
    plan: '6 Months Gold',
    daysAbsent: 9,
    lastVisitDate: 'Oct 31, 2026',
    assignedTrainer: 'Coach Vikram Sharma',
    streakLost: 12,
  },
  {
    userId: 'usr_abs_3',
    name: 'Anjali Gupta',
    phone: '+91 98200 77889',
    plan: '1 Month Starter',
    daysAbsent: 4,
    lastVisitDate: 'Nov 05, 2026',
    assignedTrainer: 'Coach Vikram Sharma',
    streakLost: 3,
  },
];

// Haversine formula to verify user distance from gym
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Rotating QR Token generator (rotates every 30s)
export function generateRotatingQRToken(): { token: string; secondsRemaining: number } {
  const now = Date.now();
  const slot = Math.floor(now / 30000); // 30-second epoch slot
  const secondsRemaining = 30 - Math.floor((now % 30000) / 1000);
  const hash = Math.abs(Math.sin(slot) * 1000000).toFixed(0).padStart(6, '0');
  const token = `GP-ROT-${hash}-${slot.toString().slice(-4)}`;
  return { token, secondsRemaining };
}

// Server-side check-in validation logic
export function processCheckIn(
  user: UserProfile,
  membership: UserMembership | null,
  method: 'qr_scan' | 'desk_scan' | 'manual_override',
  userCoordinates?: { latitude: number; longitude: number },
  bypassGeofence: boolean = false
): CheckInResult {
  // 1. Membership status check
  if (!membership || membership.status === 'expired') {
    return {
      success: false,
      errorType: 'expired_membership',
      message: 'Access Denied: Your membership has expired. Please renew your plan to enter the gym floor.',
    };
  }

  if (membership.status === 'frozen' || membership.isFrozen) {
    return {
      success: false,
      errorType: 'frozen_membership',
      message: 'Access Denied: Your membership is currently paused (frozen). Please resume your pass on the home screen.',
    };
  }

  // 2. Geofence verification (if coordinates provided and not bypassed)
  if (userCoordinates && !bypassGeofence) {
    const dist = calculateDistanceMeters(
      userCoordinates.latitude,
      userCoordinates.longitude,
      GYM_LOCATION.latitude,
      GYM_LOCATION.longitude
    );
    if (dist > GYM_LOCATION.radiusMeters) {
      return {
        success: false,
        errorType: 'geofence_failed',
        message: `Geofence Error: You are ${dist}m away from ${GYM_LOCATION.name}. Check-in requires being within 50m of the gym floor.`,
      };
    }
  }

  // 3. Prevent duplicate check-in if already in gym
  const existing = liveFloorMembers.find((m) => m.userId === user.id);
  if (existing) {
    return {
      success: false,
      errorType: 'already_checked_in',
      message: `Already Checked In: You logged in ${existing.elapsedMinutes} mins ago. Use Check-Out when leaving.`,
    };
  }

  // 4. Create successful record
  const newRecord: AttendanceRecord = {
    id: `att_${Date.now()}`,
    userId: user.id,
    userName: user.fullName,
    checkInTime: new Date().toISOString(),
    method,
    status: 'active_in_gym',
    streakCount: 15, // Incremented
  };

  // Add to live floor
  liveFloorMembers = [
    {
      id: newRecord.id,
      userId: user.id,
      name: user.fullName,
      plan: membership.planName,
      checkInTime: newRecord.checkInTime,
      elapsedMinutes: 0,
      method,
    },
    ...liveFloorMembers,
  ];

  return {
    success: true,
    message: `Welcome to IronCore, ${user.fullName.split(' ')[0]}! Check-in verified. Streak increased to 15 Days 🔥`,
    record: newRecord,
    newStreak: 15,
  };
}

export function processCheckOut(userId: string): { success: boolean; durationMinutes: number } {
  const member = liveFloorMembers.find((m) => m.userId === userId);
  if (!member) {
    return { success: false, durationMinutes: 0 };
  }

  const durationMinutes = Math.max(1, Math.round((Date.now() - new Date(member.checkInTime).getTime()) / 60000));
  liveFloorMembers = liveFloorMembers.filter((m) => m.userId !== userId);

  return {
    success: true,
    durationMinutes,
  };
}

export function getLiveFloorMembers(): LiveHeadcountMember[] {
  return liveFloorMembers;
}
