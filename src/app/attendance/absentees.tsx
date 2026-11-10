import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { mockAbsentees, AbsenteeMember } from '../../services/attendanceService';
import {
  AlertTriangle,
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  Calendar,
  Flame,
  UserCheck,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';

export default function AbsenteesFollowUpScreen() {
  const { theme } = useTheme();
  const [absentees, setAbsentees] = useState<AbsenteeMember[]>(mockAbsentees);
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  const filtered = absentees.filter((a) => {
    if (filter === 'critical') return a.daysAbsent >= 7;
    return true;
  });

  const handleWhatsAppNudge = (member: AbsenteeMember) => {
    const text = encodeURIComponent(
      `Namaste ${member.name}! We noticed you haven't checked into IronCore Fitness in ${member.daysAbsent} days. Coach Vikram has personalized your workout split. Let's get a session in today! 💪`
    );
    Alert.alert(
      'WhatsApp Motivation Sent',
      `Message dispatched to ${member.name} (${member.phone}):\n\n"Namaste ${member.name}! We noticed you haven't checked into IronCore Fitness in ${member.daysAbsent} days..."`
    );
  };

  const handlePhoneCall = (member: AbsenteeMember) => {
    Alert.alert('Calling Member', `Dialing ${member.phone} (${member.name})...`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="ABSENTEE FOLLOW-UP" subtitle="Member Retention & Motivation Outreach" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(tabs)/checkin')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* Retention Summary Banner */}
        <Card elevated style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.sumLeft}>
              <AlertTriangle size={22} color="#F59E0B" />
              <View>
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                  Retention Risk Monitor
                </Text>
                <Text style={[styles.summarySub, { color: theme.colors.textSecondary }]}>
                  Members absent for 4+ days have a 65% drop-off risk without coach follow-up.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: `All Absent (3)` },
            { id: 'critical', label: `⚠️ 7+ Days Critical (1)` },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setFilter(item.id as any)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === item.id ? theme.colors.primary : theme.colors.cardElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === item.id ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: filter === item.id ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Absentees List */}
        {filtered.map((member) => (
          <Card key={member.userId} style={styles.memberCard}>
            <View style={styles.memberTop}>
              <View>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.memberPhone, { color: theme.colors.textSecondary }]}>
                  {member.phone} • {member.plan}
                </Text>
              </View>

              <Badge
                label={`${member.daysAbsent} DAYS MISSED`}
                variant={member.daysAbsent >= 7 ? 'danger' : 'warning'}
              />
            </View>

            <View style={[styles.metaBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <View style={styles.metaRow}>
                <Calendar size={13} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.text }]}>
                  Last Visit: <Text style={{ fontWeight: '700' }}>{member.lastVisitDate}</Text>
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Flame size={13} color="#F59E0B" />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  Streak lost: {member.streakLost} days
                </Text>
              </View>

              <View style={styles.metaRow}>
                <UserCheck size={13} color={theme.colors.primary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  Coach: {member.assignedTrainer}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Button
                title="WhatsApp Nudge"
                size="sm"
                variant="primary"
                icon={<MessageCircle size={14} color={theme.colors.primaryContrast} />}
                onPress={() => handleWhatsAppNudge(member)}
                style={{ flex: 1, marginRight: 6 }}
              />
              <Button
                title="Call Member"
                size="sm"
                variant="secondary"
                icon={<PhoneCall size={14} color={theme.colors.text} />}
                onPress={() => handlePhoneCall(member)}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  summarySub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  memberCard: {
    padding: 16,
    marginBottom: 12,
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  metaBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
