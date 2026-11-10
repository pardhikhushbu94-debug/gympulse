import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { mockTrainerClients, mockLiveClasses } from '../../services/trainerService';
import {
  Users,
  Dumbbell,
  MessageSquare,
  CalendarCheck,
  Video,
  Award,
  ChevronRight,
  TrendingUp,
  Star,
  IndianRupee,
  ExternalLink,
  Plus,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function TrainerDashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const handleJoinClass = (url: string) => {
    Alert.alert('Joining Class', `Opening virtual classroom via Zoom/Google Meet:\n${url}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="TRAINER SUITE" subtitle="Client Coaching & Workout Management" />
      <QuickRoleSwitcher />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Trainer Stats & Credentials Header */}
        <Card elevated style={styles.coachCard}>
          <View style={styles.coachTop}>
            <View>
              <Text style={[styles.coachName, { color: theme.colors.text }]}>
                Coach Vikram Sharma
              </Text>
              <Text style={[styles.coachCreds, { color: theme.colors.textSecondary }]}>
                Head Strength & Conditioning Coach • ACSM & CSCS Certified
              </Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                  4.9 <Text style={{ color: theme.colors.textSecondary }}>(120 Member Reviews)</Text>
                </Text>
              </View>
            </View>
            <Badge label="HEAD COACH" variant="primary" />
          </View>

          <View style={[styles.metricsRow, { borderColor: theme.colors.border }]}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>18</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Active Clients
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: theme.colors.text }]}>94%</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Attendance Rate
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>₹48,300</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Nov PT Earnings
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Trainer Actions Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            onPress={() => router.push('/workout/create')}
            style={[styles.actionTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Dumbbell size={22} color={theme.colors.primary} />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Build Routine</Text>
            <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>Assign splits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/videos')}
            style={[styles.actionTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Video size={22} color="#FF6B00" />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Video Hub</Text>
            <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>Upload & stream</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/chat/usr_member_101')}
            style={[styles.actionTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <MessageSquare size={22} color="#3B82F6" />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Client Messages</Text>
            <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>1 unread note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/attendance/live-board')}
            style={[styles.actionTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <CalendarCheck size={22} color="#10B981" />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Floor Live</Text>
            <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>Who is in gym</Text>
          </TouchableOpacity>
        </View>

        {/* Live Classes Schedule Card */}
        <Card elevated style={styles.liveClassCard}>
          <View style={styles.classHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Upcoming Live Virtual Sessions
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                Zoom & Google Meet broadcast schedule
              </Text>
            </View>
            <Badge label="VIRTUAL" variant="primary" />
          </View>

          {mockLiveClasses.map((cls) => (
            <View
              key={cls.id}
              style={[styles.classItem, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.classTitle, { color: theme.colors.text }]}>
                  {cls.title}
                </Text>
                <Text style={[styles.classTime, { color: theme.colors.primary }]}>
                  {cls.date} • {cls.time}
                </Text>
                <Text style={[styles.classCapacity, { color: theme.colors.textSecondary }]}>
                  {cls.registeredCount}/{cls.maxCapacity} Athletes Registered ({cls.platform.toUpperCase()})
                </Text>
              </View>

              <Button
                title="Start Class"
                size="sm"
                variant="primary"
                icon={<ExternalLink size={12} color={theme.colors.primaryContrast} />}
                onPress={() => handleJoinClass(cls.joinUrl)}
              />
            </View>
          ))}
        </Card>

        {/* Assigned Clients Feed */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Assigned Clients & Form Review
        </Text>

        {mockTrainerClients.map((client) => (
          <Card key={client.memberId} style={styles.clientCard}>
            <View style={styles.clientTop}>
              <View>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>
                  {client.memberName}
                </Text>
                <Text style={[styles.clientPlan, { color: theme.colors.textSecondary }]}>
                  {client.plan} • Goal: {client.goal}
                </Text>
              </View>
              <Badge
                label={`${client.streak}d Streak`}
                variant="primary"
              />
            </View>

            <View style={[styles.clientDetails, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                🏋️ Recent session: <Text style={{ fontWeight: '700' }}>{client.lastWorkout}</Text>
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                Current Weight: {client.weightCurrentKg} kg (Down -{(client.weightStartKg - client.weightCurrentKg).toFixed(1)} kg)
              </Text>
            </View>

            <View style={styles.clientBtnRow}>
              <Button
                title="Message"
                size="sm"
                variant="secondary"
                icon={<MessageSquare size={14} color={theme.colors.text} />}
                onPress={() => router.push(`/chat/${client.memberId}`)}
                style={{ flex: 1, marginRight: 6 }}
              />
              <Button
                title="Review Dossier"
                size="sm"
                variant="primary"
                icon={<ChevronRight size={14} color={theme.colors.primaryContrast} />}
                onPress={() => router.push(`/trainer/client/${client.memberId}`)}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  coachCard: {
    padding: 18,
    marginBottom: 14,
  },
  coachTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  coachName: {
    fontSize: 20,
    fontWeight: '800',
  },
  coachCreds: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionTile: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  actionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  liveClassCard: {
    padding: 18,
    marginBottom: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  classTime: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  classCapacity: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  clientCard: {
    padding: 16,
    marginBottom: 12,
  },
  clientTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
  },
  clientPlan: {
    fontSize: 12,
    marginTop: 2,
  },
  clientDetails: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  clientBtnRow: {
    flexDirection: 'row',
  },
});
