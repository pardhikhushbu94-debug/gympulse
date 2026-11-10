import { create } from 'zustand';
import { GymClass, ClassBooking, DayOfWeek, ClassCategory } from '../types/classBooking';
import { initialGymClasses, initialMemberBookings } from '../services/classService';

interface ClassState {
  classes: GymClass[];
  userBookings: ClassBooking[];
  selectedDay: DayOfWeek | 'All';
  selectedCategory: ClassCategory;

  // Actions
  setSelectedDay: (day: DayOfWeek | 'All') => void;
  setSelectedCategory: (cat: ClassCategory) => void;
  bookClass: (classId: string, memberName?: string) => { success: boolean; isWaitlisted: boolean; message: string };
  cancelBooking: (bookingId: string) => { success: boolean; message: string };
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: initialGymClasses,
  userBookings: initialMemberBookings,
  selectedDay: 'All',
  selectedCategory: 'all',

  setSelectedDay: (selectedDay) => set({ selectedDay }),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  bookClass: (classId: string, memberName: string = 'Rajesh Kumar') => {
    const { classes, userBookings } = get();
    const gymClass = classes.find((c) => c.id === classId);

    if (!gymClass) {
      return { success: false, isWaitlisted: false, message: 'Class not found.' };
    }

    // Check if already booked
    const existing = userBookings.find(
      (b) => b.classId === classId && b.status !== 'cancelled'
    );
    if (existing) {
      return {
        success: false,
        isWaitlisted: existing.status === 'waitlisted',
        message: `You are already ${existing.status} for ${gymClass.name}.`,
      };
    }

    const isFull = gymClass.bookedCount >= gymClass.capacity;
    const bookingStatus = isFull ? 'waitlisted' : 'confirmed';

    const newBooking: ClassBooking = {
      id: `bkg_${Date.now()}`,
      classId: gymClass.id,
      className: gymClass.name,
      trainerName: gymClass.trainerName,
      dayOfWeek: gymClass.dayOfWeek,
      timeSlot: `${gymClass.startTime} – ${gymClass.endTime}`,
      room: gymClass.room,
      status: bookingStatus,
      bookedAt: 'Just now',
    };

    set({
      userBookings: [newBooking, ...userBookings],
      classes: classes.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            bookedCount: isFull ? c.bookedCount : c.bookedCount + 1,
            waitlistCount: isFull ? c.waitlistCount + 1 : c.waitlistCount,
          };
        }
        return c;
      }),
    });

    return {
      success: true,
      isWaitlisted: isFull,
      message: isFull
        ? `Added to waitlist for ${gymClass.name}. Position: #${gymClass.waitlistCount + 1}. You'll be auto-notified if a slot opens up.`
        : `Spot confirmed in ${gymClass.name}! See you in ${gymClass.room}.`,
    };
  },

  cancelBooking: (bookingId: string) => {
    const { classes, userBookings } = get();
    const booking = userBookings.find((b) => b.id === bookingId);

    if (!booking) {
      return { success: false, message: 'Booking reservation not found.' };
    }

    set({
      userBookings: userBookings.filter((b) => b.id !== bookingId),
      classes: classes.map((c) => {
        if (c.id === booking.classId) {
          if (booking.status === 'confirmed') {
            return {
              ...c,
              bookedCount: Math.max(0, c.bookedCount - 1),
            };
          } else {
            return {
              ...c,
              waitlistCount: Math.max(0, c.waitlistCount - 1),
            };
          }
        }
        return c;
      }),
    });

    return {
      success: true,
      message: `Reservation for ${booking.className} cancelled successfully.`,
    };
  },
}));
