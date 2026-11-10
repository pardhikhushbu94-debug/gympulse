import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';
import { useTheme } from '@/theme/ThemeContext';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { mockTrainerClients } from '@/services/trainerService';
import { TrainerClientDetail } from '@/types/trainer';
import {
  ArrowLeft,
  MessageSquare,
  CalendarCheck,
  Dumbbell,
  Target,
  Flame,
  Award,
  PhoneCall,
  User,
  Plus,
} from 'lucide-react-native';

export default function TrainerClientDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();

  const client =
    mockTrainerClients.find((c) => c.memberId === params.id) || mockTrainerClients[0];

  const [notes, setNotes] = useState(client.coachNotes);
  const [newNoteText, setNewNoteText] = useState('');

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newEntry = {
      id: `note_${Date.now()}`,
      date: 'Today',
      author: 'Coach Vikram',
      note: newNoteText.trim(),
    };
    setNotes([newEntry, ...notes]);
    setNewNoteText('');
    Alert.alert('Feedback Logged', 'Coach note added to member profile.');
  };

  const handleAssignRoutine = () => {
    Alert.alert('Assign Routine', 'Push Day & Pull Day routines assigned to Rajesh Kumar.');
  };

  const weightProgressPct = Math.round(
    ((client.weightStartKg - client.weightCurrentKg) /
      (client.weightStartKg - client.targetWeightKg)) *
      100
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="MEMBER DOSSIER" subtitle="Client Assessment & Progress Tracking" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(trainer)')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* Client Profile Card */}
        <Card elevated style={styles.clientProfileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarBox, { backgroundColor: theme.colors.primary }]}>
              <User size={36} color={theme.colors.primaryContrast} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clientName, { color: theme.colors.text }]}>
                {client.memberName}
              </Text>
              <Text style={[styles.clientPlan, { color: theme.colors.primary }]}>
                {client.plan}
              </Text>
              <Text style={[styles.clientContact, { color: theme.colors.textSecondary }]}>
                {client.phone} • {client.email}
              </Text>
            </View>
          </View>

          <View style={styles.actionBtnRow}>
            <Button
              title="Chat with Member"
              size="sm"
              variant="primary"
              icon={<MessageSquare size={14} color={theme.colors.primaryContrast} />}
              onPress={() => router.push(`/chat/${client.memberId}`)}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Schedule PT"
              size="sm"
              variant="secondary"
              icon={<CalendarCheck size={14} color={theme.colors.text} />}
              onPress={() => Alert.alert('Schedule Session', '1-on-1 PT slot booked for tomorrow 07:00 AM.')}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </Card>

        {/* Goal & Weight Progress */}
        <Card style={styles.card}>
          <View style={styles.goalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Target size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Primary Fitness Goal
              </Text>
            </View>
            <Badge label="IN PROGRESS" variant="primary" />
          </View>

          <Text style={[styles.goalMainText, { color: theme.colors.text }]}>
            {client.goal}
          </Text>

          {/* Weight Tracker Bar */}
          <View style={[styles.weightBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
            <View style={styles.weightNumsRow}>
              <View>
                <Text style={[styles.weightSub, { color: theme.colors.textSecondary }]}>Starting</Text>
                <Text style={[styles.weightVal, { color: theme.colors.text }]}>{client.weightStartKg} kg</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.weightSub, { color: theme.colors.primary }]}>Current</Text>
                <Text style={[styles.weightVal, { color: theme.colors.primary }]}>{client.weightCurrentKg} kg</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.weightSub, { color: theme.colors.textSecondary }]}>Target Goal</Text>
                <Text style={[styles.weightVal, { color: theme.colors.text }]}>{client.targetWeightKg} kg</Text>
              </View>
            </View>

            <View style={[styles.weightTrack, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.weightFill, { width: `${Math.min(100, Math.max(0, weightProgressPct))}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.recompText, { color: theme.colors.success }]}>
              ↓ -2.6 kg lost • 52% of target goal completed
            </Text>
          </View>

          {/* Attendance Consistency */}
          <View style={styles.attendanceRow}>
            <View style={styles.attItem}>
              <Flame size={16} color="#F59E0B" />
              <Text style={[styles.attText, { color: theme.colors.text }]}>
                Streak: <Text style={{ fontWeight: '800' }}>{client.streak} Days 🔥</Text>
              </Text>
            </View>
            <View style={styles.attItem}>
              <Award size={16} color={theme.colors.primary} />
              <Text style={[styles.attText, { color: theme.colors.text }]}>
                Consistency: <Text style={{ fontWeight: '800' }}>{client.attendanceRatePct}%</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Assigned Workout Routines */}
        <Card style={styles.card}>
          <View style={styles.goalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Assigned Routines
              </Text>
            </View>
            <Button
              title="+ Assign"
              size="sm"
              variant="outline"
              onPress={handleAssignRoutine}
            />
          </View>

          {client.assignedRoutines.map((routine, idx) => (
            <View
              key={idx}
              style={[styles.routineRow, { borderBottomColor: theme.colors.border }]}
            >
              <Text style={[styles.routineName, { color: theme.colors.text }]}>
                {idx + 1}. {routine}
              </Text>
              <Badge label="ACTIVE" variant="success" />
            </View>
          ))}
        </Card>

        {/* Coach Private Notes & Feedback */}
        <Card elevated style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 8 }]}>
            Coach Notes & Feedback History
          </Text>

          <Input
            placeholder="Log coach observation, form cue, or nutrition feedback..."
            value={newNoteText}
            onChangeText={setNewNoteText}
            multiline
            numberOfLines={2}
          />
          <Button
            title="Add Coach Note"
            size="sm"
            variant="primary"
            onPress={handleAddNote}
            style={{ marginBottom: 12 }}
          />

          <View style={styles.notesList}>
            {notes.map((note) => (
              <View
                key={note.id}
                style={[styles.noteItem, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
              >
                <View style={styles.noteTop}>
                  <Text style={[styles.noteAuthor, { color: theme.colors.primary }]}>
                    {note.author}
                  </Text>
                  <Text style={[styles.noteDate, { color: theme.colors.textSecondary }]}>
                    {note.date}
                  </Text>
                </View>
                <Text style={[styles.noteBody, { color: theme.colors.text }]}>
                  {note.note}
                </Text>
              </View>
            ))}
          </View>
        </Card>
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
  clientProfileCard: {
    padding: 18,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 19,
    fontWeight: '800',
  },
  clientPlan: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  clientContact: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  goalMainText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  weightBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  weightNumsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weightSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  weightVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  weightTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  weightFill: {
    height: '100%',
    borderRadius: 3,
  },
  recompText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attText: {
    fontSize: 13,
  },
  routineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  routineName: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesList: {
    gap: 8,
  },
  noteItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  noteDate: {
    fontSize: 11,
  },
  noteBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
