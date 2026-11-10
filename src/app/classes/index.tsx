import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useClassStore } from '@/store/classStore';
import { GymClass, ClassCategory, DayOfWeek } from '@/types/classBooking';
import { safeGoBack } from '@/utils/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Flame,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Ticket,
  XCircle,
} from 'lucide-react-native';

export default function GroupClassesScreen() {
  const { theme } = useTheme();
  const {
    classes,
    userBookings,
    selectedDay,
    setSelectedDay,
    selectedCategory,
    setSelectedCategory,
    bookClass,
    cancelBooking,
  } = useClassStore();

  const [activeTab, setActiveTab] = useState<'schedule' | 'my_bookings'>('schedule');

  const confirmedBookingsCount = userBookings.filter((b) => b.status === 'confirmed').length;

  const filteredClasses = classes.filter((c) => {
    const matchesDay = selectedDay === 'All' || c.dayOfWeek === selectedDay;
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesDay && matchesCat;
  });

  const handleBook = (cls: GymClass) => {
    const res = bookClass(cls.id);
    Alert.alert(res.success ? (res.isWaitlisted ? 'Waitlist Confirmed' : 'Booking Confirmed! 🎉') : 'Notice', res.message);
  };

  const handleCancel = (bookingId: string, className: string) => {
    Alert.alert(
      'Cancel Class Reservation',
      `Are you sure you want to cancel your slot for '${className}'? Another member on the waitlist will be offered this spot.`,
      [
        { text: 'Keep Slot', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => {
            const res = cancelBooking(bookingId);
            Alert.alert('Cancelled', res.message);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="GROUP CLASSES" subtitle="Yoga, Zumba, HIIT & Crossfit Studio" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation & Mode Switch */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>

          {/* Sub-view switcher */}
          <View style={[styles.subViewSwitch, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('schedule')}
              style={[
                styles.switchBtn,
                activeTab === 'schedule' && { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  {
                    color: activeTab === 'schedule' ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: activeTab === 'schedule' ? '700' : '500',
                  },
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('my_bookings')}
              style={[
                styles.switchBtn,
                activeTab === 'my_bookings' && { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  {
                    color: activeTab === 'my_bookings' ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: activeTab === 'my_bookings' ? '700' : '500',
                  },
                ]}
              >
                My Passes ({userBookings.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cancellation Notice Banner */}
        <View
          style={[
            styles.noticeBanner,
            { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
          ]}
        >
          <Clock size={16} color={theme.colors.primary} />
          <Text style={[styles.noticeText, { color: theme.colors.textSecondary }]}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>2-Hour Policy:</Text> Free cancellations allowed up to 2 hours before class start. Waitlist is automatically promoted.
          </Text>
        </View>

        {/* ===================== VIEW 1: EXPLORE SCHEDULE ===================== */}
        {activeTab === 'schedule' && (
          <View>
            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { key: 'all', label: 'All Disciplines' },
                { key: 'yoga', label: '🧘 Yoga & Pranayama' },
                { key: 'zumba', label: '💃 Desi Zumba' },
                { key: 'hiit', label: '🔥 HIIT & Turf' },
                { key: 'strength', label: '🏋️ Barbell Strength' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key as any)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardElevated,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isSelected ? theme.colors.primaryContrast : theme.colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Day of Week Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
              {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDay(day as any)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardElevated,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        {
                          color: isSelected ? theme.colors.primaryContrast : theme.colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {day === 'All' ? 'ANY DAY' : day.slice(0, 3).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Class Cards List */}
            {filteredClasses.length === 0 ? (
              <Card elevated style={styles.emptyCard}>
                <Calendar size={32} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Classes Scheduled</Text>
                <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
                  No group workouts matching the selected day or discipline.
                </Text>
              </Card>
            ) : (
              filteredClasses.map((cls) => {
                const existingBooking = userBookings.find(
                  (b) => b.classId === cls.id && b.status !== 'cancelled'
                );
                const isFull = cls.bookedCount >= cls.capacity;
                const fillPct = Math.min(100, Math.round((cls.bookedCount / cls.capacity) * 100));

                return (
                  <Card key={cls.id} elevated style={styles.classCard}>
                    <View style={styles.classHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.badgesRow}>
                          <Badge
                            label={cls.dayOfWeek.toUpperCase()}
                            variant="primary"
                          />
                          <Badge
                            label={`${cls.intensity.toUpperCase()} INTENSITY`}
                            variant={cls.intensity === 'High' ? 'danger' : cls.intensity === 'Moderate' ? 'warning' : 'success'}
                          />
                          {cls.caloriesBurnEstimate && (
                            <Badge
                              label={`~${cls.caloriesBurnEstimate} KCAL`}
                              variant="neutral"
                            />
                          )}
                        </View>

                        <Text style={[styles.classTitle, { color: theme.colors.text }]}>
                          {cls.name}
                        </Text>
                        <Text style={[styles.classDesc, { color: theme.colors.textSecondary }]}>
                          {cls.description}
                        </Text>
                      </View>
                    </View>

                    {/* Class Logistics Grid */}
                    <View
                      style={[
                        styles.logisticsBox,
                        { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                      ]}
                    >
                      <View style={styles.logisticsItem}>
                        <Clock size={15} color={theme.colors.primary} />
                        <Text style={[styles.logisticsText, { color: theme.colors.text }]}>
                          {cls.startTime} – {cls.endTime} ({cls.durationMinutes}m)
                        </Text>
                      </View>

                      <View style={styles.logisticsItem}>
                        <MapPin size={15} color="#38BDF8" />
                        <Text style={[styles.logisticsText, { color: theme.colors.text }]}>
                          {cls.room}
                        </Text>
                      </View>

                      <View style={styles.logisticsItem}>
                        <User size={15} color="#FBBF24" />
                        <Text style={[styles.logisticsText, { color: theme.colors.text }]}>
                          Lead: <Text style={{ fontWeight: '700' }}>{cls.trainerName}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Live Capacity Meter */}
                    <View style={styles.capacityRow}>
                      <View style={styles.capacityLabelRow}>
                        <Text style={[styles.capacityLabel, { color: theme.colors.textSecondary }]}>
                          {isFull
                            ? `CLASS FULL (${cls.waitlistCount} on waitlist)`
                            : `${cls.capacity - cls.bookedCount} of ${cls.capacity} spots remaining`}
                        </Text>
                        <Text style={[styles.capacityCount, { color: isFull ? '#EF4444' : theme.colors.primary }]}>
                          {cls.bookedCount} / {cls.capacity}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.capacityTrack,
                          { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.capacityFill,
                            {
                              width: `${fillPct}%`,
                              backgroundColor: isFull ? '#EF4444' : fillPct > 80 ? '#F59E0B' : theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Booking Action */}
                    <View style={{ marginTop: 12 }}>
                      {existingBooking ? (
                        <Button
                          title={`Booked (${existingBooking.status.toUpperCase()}) — Tap to Cancel`}
                          variant="outline"
                          onPress={() => handleCancel(existingBooking.id, cls.name)}
                        />
                      ) : isFull ? (
                        <Button
                          title={`Join Waitlist (#${cls.waitlistCount + 1} in line)`}
                          variant="secondary"
                          icon={<Ticket size={16} color={theme.colors.text} />}
                          onPress={() => handleBook(cls)}
                        />
                      ) : (
                        <Button
                          title="Reserve My Spot"
                          variant="primary"
                          icon={<Ticket size={16} color={theme.colors.primaryContrast} />}
                          onPress={() => handleBook(cls)}
                        />
                      )}
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* ===================== VIEW 2: MY BOOKED SLOTS ===================== */}
        {activeTab === 'my_bookings' && (
          <View>
            <Text style={[styles.myPassesHeading, { color: theme.colors.text }]}>
              Your Studio Reservations ({userBookings.length})
            </Text>

            {userBookings.length === 0 ? (
              <Card elevated style={styles.emptyCard}>
                <Ticket size={36} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Bookings Yet</Text>
                <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
                  Browse the group class schedule and claim your spot for Yoga, Zumba, or HIIT!
                </Text>
                <Button
                  title="Browse Schedule"
                  variant="primary"
                  size="sm"
                  onPress={() => setActiveTab('schedule')}
                  style={{ marginTop: 10 }}
                />
              </Card>
            ) : (
              userBookings.map((bkg) => (
                <Card key={bkg.id} elevated style={styles.bookingCard}>
                  <View style={styles.bookingTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bookingTitle, { color: theme.colors.text }]}>
                        {bkg.className}
                      </Text>
                      <Text style={[styles.bookingCoach, { color: theme.colors.textSecondary }]}>
                        Instructor: {bkg.trainerName} • {bkg.room}
                      </Text>
                    </View>

                    <Badge
                      label={bkg.status.toUpperCase()}
                      variant={bkg.status === 'confirmed' ? 'success' : 'warning'}
                    />
                  </View>

                  <View
                    style={[
                      styles.bookingTimeBox,
                      { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                    ]}
                  >
                    <Calendar size={16} color={theme.colors.primary} />
                    <Text style={[styles.bookingTimeText, { color: theme.colors.text }]}>
                      {bkg.dayOfWeek} • {bkg.timeSlot}
                    </Text>
                  </View>

                  <View style={styles.bookingFooterRow}>
                    <Text style={[styles.bookedAtText, { color: theme.colors.textSecondary }]}>
                      Booked {bkg.bookedAt}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleCancel(bkg.id, bkg.className)}
                      style={[styles.cancelBtn, { borderColor: '#EF4444' }]}
                    >
                      <XCircle size={14} color="#EF4444" />
                      <Text style={[styles.cancelBtnText, { color: '#EF4444' }]}>Cancel Slot</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subViewSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  switchText: {
    fontSize: 12,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  filterScroll: {
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  dayScroll: {
    gap: 8,
    marginBottom: 14,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  classCard: {
    marginBottom: 14,
    padding: 16,
  },
  classHeaderRow: {
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  classDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  logisticsBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginVertical: 10,
  },
  logisticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logisticsText: {
    fontSize: 12,
  },
  capacityRow: {
    marginTop: 6,
  },
  capacityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  capacityCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  capacityTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  myPassesHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  bookingCard: {
    marginBottom: 12,
    padding: 14,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bookingCoach: {
    fontSize: 12,
  },
  bookingTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  bookingTimeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bookingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bookedAtText: {
    fontSize: 11,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
