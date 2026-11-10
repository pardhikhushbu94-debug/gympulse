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
import { prebuiltPrograms } from '@/services/nutritionService';
import { FitnessProgram } from '@/types/nutritionAndGoals';
import { safeGoBack } from '@/utils/navigation';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  User,
  Flame,
} from 'lucide-react-native';

export default function ProgramsCatalogScreen() {
  const { theme } = useTheme();

  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>('prog_12w_recomp');
  const [enrolledProgramIds, setEnrolledProgramIds] = useState<string[]>(['prog_12w_recomp']);

  const filteredPrograms = prebuiltPrograms.filter((p) => {
    if (filterDifficulty === 'all') return true;
    return p.difficulty === filterDifficulty;
  });

  const handleEnrollToggle = (prog: FitnessProgram) => {
    if (enrolledProgramIds.includes(prog.id)) {
      Alert.alert(
        'Leave Program',
        `Do you want to disenroll from '${prog.title}'? Your logged workout records will be preserved.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () =>
              setEnrolledProgramIds(enrolledProgramIds.filter((id) => id !== prog.id)),
          },
        ]
      );
    } else {
      setEnrolledProgramIds([...enrolledProgramIds, prog.id]);
      Alert.alert(
        'Enrolled Successfully! 🎉',
        `You are now enrolled in '${prog.title}'. Workouts will show up on your daily training schedule.`
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="FITNESS PROGRAMS" subtitle="Multi-Week Periodized Masterclasses" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)/progress')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Progress</Text>
          </TouchableOpacity>

          <Badge variant="primary" label={`${prebuiltPrograms.length} Programs Available`} />
        </View>

        {/* Difficulty Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => {
            const isSelected = filterDifficulty === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setFilterDifficulty(lvl)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.cardElevated,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected
                        ? theme.colors.primaryContrast
                        : theme.colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {lvl.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Programs List */}
        {filteredPrograms.map((program) => {
          const isEnrolled = enrolledProgramIds.includes(program.id);
          const isExpanded = expandedProgramId === program.id;

          return (
            <Card key={program.id} elevated style={styles.programCard}>
              {/* Program Header */}
              <View style={styles.programHeaderRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Badge
                      variant={
                        program.difficulty === 'beginner'
                          ? 'success'
                          : program.difficulty === 'intermediate'
                          ? 'primary'
                          : 'warning'
                      }
                      label={program.difficulty.toUpperCase()}
                    />
                    {program.isPremium && (
                      <Badge variant="warning" label="PRO ADD-ON" />
                    )}
                    {isEnrolled && (
                      <Badge variant="success" label="ENROLLED" />
                    )}
                  </View>

                  <Text style={[styles.programTitle, { color: theme.colors.text }]}>
                    {program.title}
                  </Text>
                  <Text style={[styles.programSubtitle, { color: theme.colors.textSecondary }]}>
                    {program.subtitle}
                  </Text>
                </View>
              </View>

              {/* Program Meta Metrics */}
              <View
                style={[
                  styles.metaGrid,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.metaItem}>
                  <Calendar size={16} color={theme.colors.primary} />
                  <Text style={[styles.metaVal, { color: theme.colors.text }]}>
                    {program.durationWeeks} Weeks
                  </Text>
                  <Text style={[styles.metaSub, { color: theme.colors.textSecondary }]}>
                    Duration
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Dumbbell size={16} color="#38BDF8" />
                  <Text style={[styles.metaVal, { color: theme.colors.text }]}>
                    {program.weeklyWorkoutsCount}x / week
                  </Text>
                  <Text style={[styles.metaSub, { color: theme.colors.textSecondary }]}>
                    Frequency
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Target size={16} color="#FBBF24" />
                  <Text style={[styles.metaVal, { color: theme.colors.text }]}>
                    {program.targetGoal.split(' ')[0]}
                  </Text>
                  <Text style={[styles.metaSub, { color: theme.colors.textSecondary }]}>
                    Objective
                  </Text>
                </View>
              </View>

              {/* Coach Attribution */}
              <View style={styles.coachRow}>
                <User size={15} color={theme.colors.textSecondary} />
                <Text style={[styles.coachText, { color: theme.colors.textSecondary }]}>
                  Designed by <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{program.trainerName}</Text>
                </Text>
              </View>

              {/* Syllabus Accordion Toggle */}
              <TouchableOpacity
                onPress={() =>
                  setExpandedProgramId(isExpanded ? null : program.id)
                }
                style={[
                  styles.syllabusToggle,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.syllabusToggleText, { color: theme.colors.primary }]}>
                  {isExpanded ? 'Hide Milestone Breakdown' : 'View Week-by-Week Syllabus'}
                </Text>
                {isExpanded ? (
                  <ChevronUp size={16} color={theme.colors.primary} />
                ) : (
                  <ChevronDown size={16} color={theme.colors.primary} />
                )}
              </TouchableOpacity>

              {/* Expanded Syllabus Breakdown */}
              {isExpanded && (
                <View style={styles.syllabusBox}>
                  {program.scheduleOverview.map((item, idx) => (
                    <View key={idx} style={styles.syllabusItemRow}>
                      <View
                        style={[
                          styles.weekNumberPill,
                          {
                            backgroundColor: theme.colors.cardElevated,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.weekNumberText, { color: theme.colors.primary }]}>
                          W{item.week}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.syllabusFocus, { color: theme.colors.text }]}>
                          {item.focus}
                        </Text>
                        <Text
                          style={[
                            styles.syllabusDesc,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Enroll Button */}
              <View style={{ marginTop: 14 }}>
                <Button
                  title={isEnrolled ? 'Enrolled (Tap to Leave)' : 'Enroll in Program'}
                  variant={isEnrolled ? 'outline' : 'primary'}
                  onPress={() => handleEnrollToggle(program)}
                />
              </View>
            </Card>
          );
        })}
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
    marginBottom: 16,
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
  filterScroll: {
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  programCard: {
    marginBottom: 16,
    padding: 16,
  },
  programHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 12,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  metaSub: {
    fontSize: 11,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  coachText: {
    fontSize: 12,
  },
  syllabusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  syllabusToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  syllabusBox: {
    paddingTop: 10,
    gap: 12,
  },
  syllabusItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  weekNumberPill: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberText: {
    fontSize: 13,
    fontWeight: '800',
  },
  syllabusFocus: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  syllabusDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
