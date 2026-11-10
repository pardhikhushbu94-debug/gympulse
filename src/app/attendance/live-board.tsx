import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  getLiveFloorMembers,
  processCheckOut,
  LiveHeadcountMember,
} from '../../services/attendanceService';
import {
  Users,
  Search,
  Clock,
  ArrowLeft,
  LogOut,
  Plus,
  ShieldCheck,
  Activity,
  Tv,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';

export default function LiveAttendanceBoardScreen() {
  const { theme } = useTheme();
  const [members, setMembers] = useState<LiveHeadcountMember[]>(getLiveFloorMembers());
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.plan.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckOut = (member: LiveHeadcountMember) => {
    const res = processCheckOut(member.userId);
    if (res.success) {
      setMembers(members.filter((m) => m.userId !== member.userId));
      Alert.alert(
        'Member Checked Out',
        `${member.name} completed workout session (${res.durationMinutes} minutes logged).`
      );
    }
  };

  const capacityPct = Math.round((members.length / 60) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="LIVE GYM FLOOR" subtitle="Real-time Attendance & Floor Occupancy" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)/checkin')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>

          <Button
            title="Open Kiosk TV View"
            size="sm"
            variant="outline"
            icon={<Tv size={14} color={theme.colors.primary} />}
            onPress={() => router.push('/attendance/gym-display')}
          />
        </View>

        {/* Capacity Occupancy Meter Card */}
        <Card elevated style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <View>
              <Text style={[styles.capacityTitle, { color: theme.colors.text }]}>
                Floor Occupancy Meter
              </Text>
              <Text style={[styles.capacitySub, { color: theme.colors.textSecondary }]}>
                Gym max capacity: 60 athletes simultaneously
              </Text>
            </View>
            <Badge
              label={capacityPct > 75 ? 'HIGH TRAFFIC' : capacityPct > 45 ? 'MODERATE' : 'OPTIMAL'}
              variant={capacityPct > 75 ? 'danger' : capacityPct > 45 ? 'warning' : 'success'}
            />
          </View>

          <View style={styles.countRow}>
            <Text style={[styles.headcountBig, { color: theme.colors.primary }]}>
              {members.length}
            </Text>
            <Text style={[styles.slashTotal, { color: theme.colors.textSecondary }]}>
              / 60 on floor
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.colors.cardElevated }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${capacityPct}%`,
                  backgroundColor: capacityPct > 75 ? theme.colors.danger : theme.colors.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.capacityDesc, { color: theme.colors.textSecondary }]}>
            {capacityPct < 50
              ? '🟢 Plenty of free squat racks and flat benches available.'
              : '🟡 Moderate floor load. Free weights are busy.'}
          </Text>
        </Card>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
          ]}
        >
          <Search size={18} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search active member by name..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
        </View>

        {/* Live Members Roster */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Currently on Floor ({filtered.length})
        </Text>

        {filtered.map((member) => (
          <Card key={member.id} style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <View style={[styles.avatarBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.avatarInitial, { color: theme.colors.primary }]}>
                  {member.name.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.memberPlan, { color: theme.colors.textSecondary }]}>
                  {member.plan}
                </Text>
                <View style={styles.timeTag}>
                  <Clock size={12} color={theme.colors.primary} />
                  <Text style={[styles.timeTagText, { color: theme.colors.textSecondary }]}>
                    In: {new Date(member.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({member.elapsedMinutes}m on floor)
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleCheckOut(member)}
              style={[styles.checkOutBtn, { borderColor: theme.colors.danger }]}
            >
              <LogOut size={14} color={theme.colors.danger} />
              <Text style={[styles.checkOutText, { color: theme.colors.danger }]}>
                Check Out
              </Text>
            </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  capacityCard: {
    padding: 18,
    marginBottom: 14,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  capacityTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  capacitySub: {
    fontSize: 12,
    marginTop: 2,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  headcountBig: {
    fontSize: 34,
    fontWeight: '900',
  },
  slashTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  capacityDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberPlan: {
    fontSize: 12,
    marginTop: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeTagText: {
    fontSize: 11,
  },
  checkOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkOutText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
