import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Flame,
  Calendar,
  Users,
  Play,
  QrCode,
  Utensils,
  Trophy,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  X,
  Bell,
  BookOpen,
  Video,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function MemberHomeScreen() {
  const { theme } = useTheme();
  const { user, membership, updateMembership } = useAuthStore();
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeDaysSelected, setFreezeDaysSelected] = useState(7);

  const isFrozen = membership?.isFrozen;

  const handleToggleFreeze = () => {
    if (isFrozen) {
      if (membership) {
        updateMembership({
          ...membership,
          isFrozen: false,
          status: 'active',
        });
      }
      Alert.alert('Membership Reactivated', 'Your gym pass is active. Welcome back!');
    } else {
      setShowFreezeModal(true);
    }
  };

  const handleConfirmFreeze = () => {
    if (!membership) return;
    const remainingFreeze = Math.max(0, (membership.freezeDaysRemaining || 15) - freezeDaysSelected);
    updateMembership({
      ...membership,
      isFrozen: true,
      status: 'frozen',
      freezeDaysRemaining: remainingFreeze,
    });
    setShowFreezeModal(false);
    Alert.alert(
      'Membership Paused',
      `Your pass is frozen for ${freezeDaysSelected} days. Your expiry date has been automatically extended.`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />
      <QuickRoleSwitcher />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Streak Motivation Banner */}
        <View
          style={[
            styles.streakBanner,
            { backgroundColor: theme.isDark ? '#2B1B06' : '#FEF3C7', borderColor: theme.colors.warning },
          ]}
        >
          <View style={styles.streakLeft}>
            <Flame size={24} color="#F59E0B" fill="#F59E0B" />
            <View>
              <Text style={[styles.streakTitle, { color: theme.isDark ? '#FDE68A' : '#92400E' }]}>
                14-Day Gym Streak!
              </Text>
              <Text style={[styles.streakSub, { color: theme.isDark ? '#FCD34D' : '#B45309' }]}>
                Check-in today to keep your fitness streak alive.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/checkin')}
            style={[styles.streakActionBtn, { backgroundColor: '#F59E0B' }]}
          >
            <Text style={styles.streakActionText}>Check In</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Status Card */}
        <Card elevated style={styles.membershipCard}>
          <View style={styles.membershipTopRow}>
            <View>
              <Text style={[styles.membershipLabel, { color: theme.colors.textMuted }]}>
                MEMBERSHIP PASS
              </Text>
              <Text style={[styles.membershipPlanName, { color: theme.colors.text }]}>
                {membership?.planName || '6 Months Gold Plan'}
              </Text>
            </View>
            <Badge
              label={isFrozen ? 'FROZEN / PAUSED' : 'ACTIVE'}
              variant={isFrozen ? 'warning' : 'success'}
            />
          </View>

          <View style={styles.membershipStatsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isFrozen ? theme.colors.warning : theme.colors.primary }]}>
                {membership?.daysRemaining || 42}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Days Left
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {membership?.freezeDaysRemaining ?? 15}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Freeze Days
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                ₹8,999
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Paid (18% GST)
              </Text>
            </View>
          </View>

          <View style={styles.membershipActionRow}>
            <Button
              title="Renew / Upgrade"
              size="sm"
              variant="primary"
              onPress={() => router.push('/plans')}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title={isFrozen ? 'Resume Pass' : 'Pause (Freeze)'}
              size="sm"
              variant={isFrozen ? 'primary' : 'secondary'}
              icon={
                isFrozen ? (
                  <PlayCircle size={14} color={theme.colors.primaryContrast} />
                ) : (
                  <PauseCircle size={14} color={theme.colors.text} />
                )
              }
              onPress={handleToggleFreeze}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </Card>

        {/* Live Gym Floor Headcount */}
        <Card style={styles.liveFloorCard}>
          <View style={styles.liveLeft}>
            <View style={styles.pulseDot} />
            <Users size={18} color={theme.colors.success} />
            <Text style={[styles.liveText, { color: theme.colors.text }]}>
              <Text style={{ fontWeight: '800' }}>18 Members</Text> on floor now
            </Text>
          </View>
          <Text style={[styles.liveSub, { color: theme.colors.textSecondary }]}>
            Moderate traffic • Good time for bench & squats
          </Text>
        </Card>

        {/* Today's Workout Program */}
        <Card elevated style={styles.todayWorkoutCard}>
          <View style={styles.workoutHeader}>
            <Badge label="TODAY'S SPLIT" variant="primary" />
            <Text style={[styles.workoutTime, { color: theme.colors.textSecondary }]}>
              55 Mins • 5 Exercises
            </Text>
          </View>

          <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>
            Push Day: Chest & Front Delts
          </Text>
          <Text style={[styles.workoutCoach, { color: theme.colors.textSecondary }]}>
            Assigned by Coach Vikram Sharma
          </Text>

          <View style={styles.exercisesPreview}>
            <Text style={[styles.previewItem, { color: theme.colors.text }]}>
              1. Barbell Flat Bench Press — 4 sets × 8-10 reps
            </Text>
            <Text style={[styles.previewItem, { color: theme.colors.text }]}>
              2. Incline Dumbbell Press — 3 sets × 10-12 reps
            </Text>
            <Text style={[styles.previewItem, { color: theme.colors.text }]}>
              3. Dumbbell Seated Overhead Press — 3 sets × 10 reps
            </Text>
          </View>

          <Button
            title="Start Guided Workout Player"
            variant="primary"
            icon={<Play size={16} color={theme.colors.primaryContrast} fill={theme.colors.primaryContrast} />}
            onPress={() => router.push('/(tabs)/workouts')}
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* Quick Hub Grid */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Quick Access
        </Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/checkin')}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: theme.colors.primaryGlow }]}>
              <QrCode size={22} color={theme.colors.primary} />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>QR Check-in</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Scan desk code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/plans')}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(204, 255, 0, 0.15)' }]}>
              <ShieldCheck size={22} color={theme.colors.primary} />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Plans Store</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>App discounts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/progress')}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
              <Trophy size={22} color="#FF6B00" />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Personal Records</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Bench, Squat PRs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <UserCheck size={22} color="#3B82F6" />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Trainer Chat</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Coach Vikram</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/diet' as any)}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Utensils size={22} color="#10B981" />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Indian Diet</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Macros & Hydration</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/videos' as any)}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Video size={22} color="#EF4444" />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Video Hub</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Tutorials & Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/classes' as any)}
            style={[styles.gridTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={[styles.tileIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Calendar size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.tileTitle, { color: theme.colors.text }]}>Studio Classes</Text>
            <Text style={[styles.tileSub, { color: theme.colors.textSecondary }]}>Yoga, Zumba, HIIT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Freeze Membership Modal */}
      <Modal visible={showFreezeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Pause (Freeze) Membership
                </Text>
                <Text style={[styles.modalSub, { color: theme.colors.textSecondary }]}>
                  {membership?.freezeDaysRemaining ?? 15} Freeze Days Available
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowFreezeModal(false)}>
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalBodyText, { color: theme.colors.textSecondary }]}>
              Select the number of days to temporarily freeze your membership. Your remaining days will be saved and extended.
            </Text>

            <View style={styles.freezeOptionsRow}>
              {[7, 14, 15].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setFreezeDaysSelected(d)}
                  style={[
                    styles.freezePill,
                    {
                      backgroundColor: freezeDaysSelected === d ? theme.colors.primary : theme.colors.cardElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.freezePillText,
                      {
                        color: freezeDaysSelected === d ? theme.colors.primaryContrast : theme.colors.text,
                        fontWeight: freezeDaysSelected === d ? '800' : '500',
                      },
                    ]}
                  >
                    {d} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={`Confirm ${freezeDaysSelected}-Day Freeze`}
              variant="primary"
              onPress={handleConfirmFreeze}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  streakSub: {
    fontSize: 11,
    marginTop: 1,
  },
  streakActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  streakActionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  membershipCard: {
    padding: 18,
    marginBottom: 14,
  },
  membershipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  membershipLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  membershipPlanName: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  membershipStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  membershipActionRow: {
    flexDirection: 'row',
  },
  liveFloorCard: {
    padding: 12,
    marginBottom: 14,
  },
  liveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 14,
  },
  liveSub: {
    fontSize: 12,
    marginLeft: 16,
  },
  todayWorkoutCard: {
    padding: 18,
    marginBottom: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  workoutCoach: {
    fontSize: 13,
    marginBottom: 12,
  },
  exercisesPreview: {
    gap: 6,
    paddingVertical: 8,
  },
  previewItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridTile: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  tileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileSub: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  freezeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  freezePill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  freezePillText: {
    fontSize: 14,
  },
});
